package com.flowsync.task;

import com.flowsync.common.ApiResponse;
import com.flowsync.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getProjectTasks(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<TaskDto> tasks = taskService.getTasksForProject(projectId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(tasks));
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<TaskDto>> createProjectTask(
            @PathVariable String projectId,
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        request.setProjectId(projectId);
        TaskDto created = taskService.createTask(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Task created successfully.", created));
    }

    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getAllTasks(@AuthenticationPrincipal UserPrincipal principal) {
        List<TaskDto> tasks = taskService.getAllAccessibleTasks(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(tasks));
    }

    @PostMapping("/tasks")
    public ResponseEntity<ApiResponse<TaskDto>> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TaskDto created = taskService.createTask(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Task created successfully.", created));
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskDto>> getTask(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TaskDto task = taskService.getTaskById(taskId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(task));
    }

    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskDto>> patchTask(
            @PathVariable String taskId,
            @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TaskDto updated = taskService.updateTask(taskId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Task updated successfully.", updated));
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<TaskDto>> putTask(
            @PathVariable String taskId,
            @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TaskDto updated = taskService.updateTask(taskId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Task updated successfully.", updated));
    }

    @PatchMapping("/tasks/{taskId}/status")
    public ResponseEntity<ApiResponse<TaskDto>> updateStatus(
            @PathVariable String taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        TaskDto updated = taskService.updateTaskStatus(taskId, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Task status updated.", updated));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        taskService.deleteTask(taskId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Task deleted successfully.", null));
    }

    @GetMapping("/tasks/calendar")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getCalendarTasks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<TaskDto> tasks = taskService.getCalendarTasks(start, end, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(tasks));
    }
}
