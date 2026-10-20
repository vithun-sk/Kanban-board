package com.flowsync.task;

import com.flowsync.exception.BadRequestException;
import com.flowsync.exception.ResourceNotFoundException;
import com.flowsync.project.Project;
import com.flowsync.project.ProjectMemberRepository;
import com.flowsync.project.ProjectRepository;
import com.flowsync.project.ProjectService;
import com.flowsync.user.User;
import com.flowsync.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskLabelRepository taskLabelRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;

    public TaskService(
            TaskRepository taskRepository,
            TaskLabelRepository taskLabelRepository,
            ProjectRepository projectRepository,
            ProjectMemberRepository memberRepository,
            UserRepository userRepository,
            ProjectService projectService
    ) {
        this.taskRepository = taskRepository;
        this.taskLabelRepository = taskLabelRepository;
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.projectService = projectService;
    }

    public List<TaskDto> getTasksForProject(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        projectService.validateProjectAccess(project, userId);

        return taskRepository.findByProjectIdWithLabels(projectId).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getAllAccessibleTasks(String userId) {
        return taskRepository.findAccessibleTasks(userId).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }

    public TaskDto getTaskById(String taskId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));
        projectService.validateProjectAccess(task.getProject(), userId);
        return TaskDto.fromEntity(task);
    }

    @Transactional
    public TaskDto createTask(CreateTaskRequest request, String userId) {
        if (request.getProjectId() == null || request.getProjectId().isBlank()) {
            throw new BadRequestException("Project ID is required.");
        }

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));
        projectService.validateProjectAccess(project, userId);

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        User assignee = null;
        if (request.getAssigneeId() != null && !request.getAssigneeId().isBlank()) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found."));
            boolean isMember = memberRepository.existsByProjectIdAndUserId(project.getId(), assignee.getId())
                    || project.getCreatedBy().getId().equals(assignee.getId());
            if (!isMember) {
                throw new BadRequestException("Assignee must be a member of the project.");
            }
        }

        String taskId = UUID.randomUUID().toString();
        Task task = new Task(
                taskId,
                project,
                request.getTitle().trim(),
                request.getDescription() != null ? request.getDescription().trim() : "",
                TaskStatus.fromString(request.getStatus()),
                TaskPriority.fromString(request.getPriority()),
                assignee,
                request.getStartDate(),
                request.getDueDate(),
                creator
        );

        if (request.getLabels() != null) {
            for (String label : request.getLabels()) {
                if (label != null && !label.isBlank()) {
                    task.getLabels().add(new TaskLabel(UUID.randomUUID().toString(), task, label.trim()));
                }
            }
        }

        Task saved = taskRepository.save(task);
        return TaskDto.fromEntity(saved);
    }

    @Transactional
    public TaskDto updateTask(String taskId, UpdateTaskRequest request, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));
        projectService.validateProjectAccess(task.getProject(), userId);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            task.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null) {
            task.setStatus(TaskStatus.fromString(request.getStatus()));
        }
        if (request.getPriority() != null) {
            task.setPriority(TaskPriority.fromString(request.getPriority()));
        }
        if (request.getStartDate() != null) {
            task.setStartDate(request.getStartDate());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }

        if (request.getAssigneeId() != null) {
            if (request.getAssigneeId().isBlank()) {
                task.setAssignee(null);
            } else {
                User assignee = userRepository.findById(request.getAssigneeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Assignee not found."));
                boolean isMember = memberRepository.existsByProjectIdAndUserId(task.getProject().getId(), assignee.getId())
                        || task.getProject().getCreatedBy().getId().equals(assignee.getId());
                if (!isMember) {
                    throw new BadRequestException("Assignee must be a member of the project.");
                }
                task.setAssignee(assignee);
            }
        }

        if (request.getLabels() != null) {
            task.getLabels().clear();
            for (String label : request.getLabels()) {
                if (label != null && !label.isBlank()) {
                    task.getLabels().add(new TaskLabel(UUID.randomUUID().toString(), task, label.trim()));
                }
            }
        }

        Task saved = taskRepository.save(task);
        return TaskDto.fromEntity(saved);
    }

    @Transactional
    public TaskDto updateTaskStatus(String taskId, UpdateTaskStatusRequest request, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));
        projectService.validateProjectAccess(task.getProject(), userId);

        task.setStatus(TaskStatus.fromString(request.getStatus()));
        Task saved = taskRepository.save(task);
        return TaskDto.fromEntity(saved);
    }

    @Transactional
    public void deleteTask(String taskId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));
        projectService.validateProjectAccess(task.getProject(), userId);

        taskRepository.delete(task);
    }

    public List<TaskDto> getCalendarTasks(LocalDate start, LocalDate end, String userId) {
        LocalDate startDate = start != null ? start : LocalDate.now().minusMonths(3);
        LocalDate endDate = end != null ? end : LocalDate.now().plusMonths(3);

        return taskRepository.findTasksInDateRange(userId, startDate, endDate).stream()
                .map(TaskDto::fromEntity)
                .collect(Collectors.toList());
    }
}
