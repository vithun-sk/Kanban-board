package com.flowsync.config;

import com.flowsync.message.Conversation;
import com.flowsync.message.ConversationMember;
import com.flowsync.message.ConversationRepository;
import com.flowsync.message.Message;
import com.flowsync.message.MessageRepository;
import com.flowsync.project.Project;
import com.flowsync.project.ProjectMember;
import com.flowsync.project.ProjectRepository;
import com.flowsync.task.*;
import com.flowsync.user.User;
import com.flowsync.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    public DevDataSeeder(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        String defaultHashedPassword = passwordEncoder.encode("Password123!");

        User u1 = new User("m1", "Vithun S K", "vithun@example.com", defaultHashedPassword, "Owner", "Product Lead");
        User u2 = new User("m2", "Mathew Chen", "mathew@example.com", defaultHashedPassword, "Developer", "Frontend Engineer");
        User u3 = new User("m3", "Steve Ramirez", "steve@example.com", defaultHashedPassword, "Developer", "Backend Engineer");
        User u4 = new User("m4", "Priya Nair", "priya@example.com", defaultHashedPassword, "Designer", "Product Designer");
        User u5 = new User("m5", "Jordan Lee", "jordan@example.com", defaultHashedPassword, "QA", "Quality Analyst");

        userRepository.save(u1);
        userRepository.save(u2);
        userRepository.save(u3);
        userRepository.save(u4);
        userRepository.save(u5);

        Project p1 = new Project("p1", "FlowSync", "Collaborative project management platform for modern teams.",
                "In Progress", "Team", "#4f46e5", LocalDate.of(2026, 7, 10), LocalDate.of(2026, 11, 15), u1);
        p1.getMembers().add(new ProjectMember(UUID.randomUUID().toString(), p1, u1, "Owner"));
        p1.getMembers().add(new ProjectMember(UUID.randomUUID().toString(), p1, u2, "Developer"));
        p1.getMembers().add(new ProjectMember(UUID.randomUUID().toString(), p1, u3, "Developer"));
        p1.getMembers().add(new ProjectMember(UUID.randomUUID().toString(), p1, u4, "Designer"));
        p1.getMembers().add(new ProjectMember(UUID.randomUUID().toString(), p1, u5, "QA"));
        projectRepository.save(p1);

        Project p2 = new Project("p2", "E-Commerce Platform", "A scalable shopping platform with payments and analytics.",
                "In Progress", "Team", "#2563eb", LocalDate.of(2026, 8, 1), LocalDate.of(2026, 12, 1), u1);
        p2.getMembers().add(new ProjectMember(UUID.randomUUID().toString(), p2, u1, "Owner"));
        p2.getMembers().add(new ProjectMember(UUID.randomUUID().toString(), p2, u2, "Developer"));
        p2.getMembers().add(new ProjectMember(UUID.randomUUID().toString(), p2, u3, "Developer"));
        p2.getMembers().add(new ProjectMember(UUID.randomUUID().toString(), p2, u5, "QA"));
        projectRepository.save(p2);

        Task t1 = new Task("t1", p1, "Design authentication screens", "Create the login and registration user experience.",
                TaskStatus.IN_REVIEW, TaskPriority.HIGH, u1, LocalDate.of(2026, 10, 6), LocalDate.of(2026, 10, 18), u1);
        t1.getLabels().add(new TaskLabel(UUID.randomUUID().toString(), t1, "UI/UX"));
        t1.getLabels().add(new TaskLabel(UUID.randomUUID().toString(), t1, "Frontend"));
        taskRepository.save(t1);

        Task t2 = new Task("t2", p1, "Create dashboard layout", "Build the main dashboard structure and navigation.",
                TaskStatus.IN_PROGRESS, TaskPriority.HIGH, u2, LocalDate.of(2026, 10, 8), LocalDate.of(2026, 10, 24), u1);
        t2.getLabels().add(new TaskLabel(UUID.randomUUID().toString(), t2, "Frontend"));
        taskRepository.save(t2);

        Task t3 = new Task("t3", p1, "Implement project REST endpoints", "Implement Spring Boot project and task REST APIs.",
                TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, u3, LocalDate.of(2026, 10, 10), LocalDate.of(2026, 10, 28), u1);
        t3.getLabels().add(new TaskLabel(UUID.randomUUID().toString(), t3, "Backend"));
        t3.getLabels().add(new TaskLabel(UUID.randomUUID().toString(), t3, "API"));
        taskRepository.save(t3);

        Task t4 = new Task("t4", p1, "Design MySQL schema", "Define relational tables for users, projects, tasks, and memberships.",
                TaskStatus.DONE, TaskPriority.HIGH, u1, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 10, 12), u1);
        t4.getLabels().add(new TaskLabel(UUID.randomUUID().toString(), t4, "Backend"));
        t4.getLabels().add(new TaskLabel(UUID.randomUUID().toString(), t4, "Database"));
        taskRepository.save(t4);

        Task t5 = new Task("t5", p1, "Fix mobile sidebar", "Resolve sidebar responsiveness issues on smaller screens.",
                TaskStatus.TODO, TaskPriority.URGENT, u2, LocalDate.of(2026, 10, 15), LocalDate.of(2026, 10, 20), u1);
        t5.getLabels().add(new TaskLabel(UUID.randomUUID().toString(), t5, "Bug"));
        t5.getLabels().add(new TaskLabel(UUID.randomUUID().toString(), t5, "Frontend"));
        taskRepository.save(t5);

        Conversation conv = new Conversation("c1", "Mathew Chen");
        conv.getMembers().add(new ConversationMember(UUID.randomUUID().toString(), conv, u1));
        conv.getMembers().add(new ConversationMember(UUID.randomUUID().toString(), conv, u2));
        conversationRepository.save(conv);

        Message m1 = new Message(UUID.randomUUID().toString(), conv, u2, "Hey Vithun, dashboard responsive layouts are almost ready.");
        Message m2 = new Message(UUID.randomUUID().toString(), conv, u1, "Awesome Mathew! Let me know once you push the PR.");
        messageRepository.save(m1);
        messageRepository.save(m2);
    }
}
