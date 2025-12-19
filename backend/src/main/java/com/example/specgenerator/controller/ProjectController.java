package com.example.specgenerator.controller;

import com.example.specgenerator.model.Project;
import com.example.specgenerator.model.User;
import com.example.specgenerator.repository.ProjectRepository;
import com.example.specgenerator.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public List<Project> getAllProjects() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return projectRepository.findByUserId(user.getId());
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        project.setUser(user);
        return projectRepository.save(project);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return projectRepository.findById(id)
                .filter(p -> p.getUser().getId().equals(user.getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("錯誤：找不到使用者"));

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("錯誤：找不到專案"));

        if (!project.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("錯誤：您沒有權限修改此專案");
        }

        project.setName(projectDetails.getName());
        project.setDescription(projectDetails.getDescription());

        Project updatedProject = projectRepository.save(project);
        return ResponseEntity.ok(updatedProject);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("錯誤：找不到使用者"));

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("錯誤：找不到專案"));

        if (!project.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("錯誤：您沒有權限刪除此專案");
        }

        projectRepository.delete(project);

        return ResponseEntity.ok().build();
    }
}
