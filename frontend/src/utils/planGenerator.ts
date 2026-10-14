import { TodoTask, StudentProfile, WeakAreaItem, TodayPlannedSession } from '../types';

export interface StudyPlanComputation {
  scheduledSessions: TodayPlannedSession[];
  completedTodayTasks: TodoTask[];
  totalWorkloadMinutes: number;
  availableMinutes: number;
  hasConflict: boolean;
  overflowMinutes: number;
  recommendedScheduleSummary: string;
}

/**
 * Generates an adaptive, realistic daily study plan strictly from the student's real tasks,
 * subject proficiencies, deadlines, and available study minutes.
 */
export function generateTodayStudyPlan(
  tasks: TodoTask[],
  profile: StudentProfile,
  weakAreas: WeakAreaItem[]
): StudyPlanComputation {
  const availableMinutes = profile.dailyMinutes || 120;
  const todayStr = new Date().toISOString().split('T')[0];

  // Set of identified weak subjects
  const weakSubjects = new Set<string>();
  profile.subjects.forEach(s => {
    if (s.proficiency <= 2) weakSubjects.add(s.name.toLowerCase());
  });
  weakAreas.forEach(w => {
    weakSubjects.add(w.subject.toLowerCase());
  });

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTodayTasks = tasks.filter(t => t.completed);

  // Total minutes of all incomplete tasks needing attention
  const totalWorkloadMinutes = incompleteTasks.reduce(
    (sum, t) => sum + (t.estimatedMinutes || 45),
    0
  );

  // Score each incomplete task for prioritization
  interface ScoredTask {
    task: TodoTask;
    score: number;
    reason: string;
    isOverdue: boolean;
    isDueToday: boolean;
    isWeakSubject: boolean;
  }

  const scoredTasks: ScoredTask[] = incompleteTasks.map(t => {
    let score = 0;
    let reason = 'Routine Study Task';
    const isOverdue = t.deadline < todayStr;
    const isDueToday = t.deadline === todayStr;
    const isWeakSubject = weakSubjects.has(t.subject.toLowerCase());

    if (isOverdue) {
      score += 1000;
      reason = `🚨 Overdue (Target was ${t.deadline})`;
    } else if (isDueToday) {
      score += 500;
      reason = '⚡ Due Today';
    } else {
      const diffDays = Math.ceil(
        (new Date(t.deadline).getTime() - new Date(todayStr).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (diffDays <= 2) {
        score += 250;
        reason = `📅 Approaching Deadline (${diffDays} day${diffDays === 1 ? '' : 's'} left)`;
      } else {
        score += 50;
        reason = 'Upcoming Milestone';
      }
    }

    // Priority modifier
    if (t.priority === 'Urgent') score += 300;
    else if (t.priority === 'High') score += 200;
    else if (t.priority === 'Medium') score += 100;

    // Weak subject boost
    if (isWeakSubject) {
      score += 220;
      reason = isOverdue
        ? `🚨 Overdue & Identified Weak Subject`
        : isDueToday
        ? `⚡ Due Today in Weak Area`
        : `⚠️ Weak Area Focus (${t.subject})`;
    }

    return {
      task: t,
      score,
      reason,
      isOverdue,
      isDueToday,
      isWeakSubject,
    };
  });

  // Sort descending by calculated urgency score
  scoredTasks.sort((a, b) => b.score - a.score);

  // Fit sessions within available study capacity
  const scheduledSessions: TodayPlannedSession[] = [];
  let allocatedMinutes = 0;

  for (const item of scoredTasks) {
    const task = item.task;
    const taskMinutes = task.estimatedMinutes || 45;

    // Check if we already reached daily capacity
    if (allocatedMinutes >= availableMinutes) {
      break;
    }

    const remainingCapacity = availableMinutes - allocatedMinutes;

    // Break down large tasks (>= 60 mins) into manageable sessions
    if (taskMinutes >= 60) {
      const firstSessionMinutes = Math.min(taskMinutes > 60 ? 45 : 35, remainingCapacity);
      if (firstSessionMinutes >= 20) {
        scheduledSessions.push({
          id: `session-${task.id}-part1`,
          taskId: task.id,
          taskTitle: `${task.title} (Part 1: Concept & Problem Setup)`,
          subject: task.subject,
          durationMinutes: firstSessionMinutes,
          priority: task.priority,
          reason: item.reason,
          isBreakdown: true,
          sessionNumber: 1,
          totalSessions: 2,
          completed: false,
        });
        allocatedMinutes += firstSessionMinutes;
      }

      // If room remains for part 2
      const secondPartNeeded = taskMinutes - firstSessionMinutes;
      const roomForPart2 = availableMinutes - allocatedMinutes;
      if (secondPartNeeded > 0 && roomForPart2 >= 20) {
        const secondSessionMinutes = Math.min(secondPartNeeded, roomForPart2);
        scheduledSessions.push({
          id: `session-${task.id}-part2`,
          taskId: task.id,
          taskTitle: `${task.title} (Part 2: Practice Drill & Self-Check)`,
          subject: task.subject,
          durationMinutes: secondSessionMinutes,
          priority: task.priority,
          reason: item.reason,
          isBreakdown: true,
          sessionNumber: 2,
          totalSessions: 2,
          completed: false,
        });
        allocatedMinutes += secondSessionMinutes;
      }
    } else {
      // Standard task (under 60 mins)
      const sessionMinutes = Math.min(taskMinutes, remainingCapacity);
      if (sessionMinutes >= 15) {
        scheduledSessions.push({
          id: `session-${task.id}`,
          taskId: task.id,
          taskTitle: task.title,
          subject: task.subject,
          durationMinutes: sessionMinutes,
          priority: task.priority,
          reason: item.reason,
          isBreakdown: false,
          completed: false,
        });
        allocatedMinutes += sessionMinutes;
      }
    }
  }

  // Workload conflict check
  const urgentWorkloadMinutes = scoredTasks
    .filter(st => st.isOverdue || st.isDueToday || st.task.priority === 'Urgent')
    .reduce((sum, st) => sum + (st.task.estimatedMinutes || 45), 0);

  const hasConflict = urgentWorkloadMinutes > availableMinutes;
  const overflowMinutes = Math.max(0, urgentWorkloadMinutes - availableMinutes);

  let recommendedScheduleSummary = '';
  if (scheduledSessions.length === 0) {
    recommendedScheduleSummary =
      'No pending tasks scheduled for today. Add tasks above to generate an adaptive session plan.';
  } else if (hasConflict) {
    recommendedScheduleSummary = `⚠️ Urgent workload (${urgentWorkloadMinutes} mins) exceeds your daily capacity (${availableMinutes} mins). We have scheduled the highest-priority ${allocatedMinutes} mins; consider rescheduling remaining items.`;
  } else {
    recommendedScheduleSummary = `Planned ${scheduledSessions.length} focused study sessions totaling ${allocatedMinutes} mins (${(allocatedMinutes / 60).toFixed(1)} hrs), prioritizing ${weakSubjects.size > 0 ? 'weak topics and ' : ''}approaching deadlines.`;
  }

  return {
    scheduledSessions,
    completedTodayTasks,
    totalWorkloadMinutes,
    availableMinutes,
    hasConflict,
    overflowMinutes,
    recommendedScheduleSummary,
  };
}
