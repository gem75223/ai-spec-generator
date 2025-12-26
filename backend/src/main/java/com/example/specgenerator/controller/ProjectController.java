package com.example.specgenerator.controller;

import com.example.specgenerator.model.Project;
import com.example.specgenerator.model.Member;
import com.example.specgenerator.repository.ProjectRepository;
import com.example.specgenerator.repository.MemberRepository;
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
    MemberRepository memberRepository;

    @GetMapping
    public List<Project> getAllProjects() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Member member = memberRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Member not found"));
        return projectRepository.findByMemberId(member.getId());
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Member member = memberRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Member not found"));
        project.setMember(member);
        return projectRepository.save(project);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Member member = memberRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Member not found"));

        return projectRepository.findById(id)
                .filter(p -> p.getMember().getId().equals(member.getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Member member = memberRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("錯誤：找不到會員"));

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("錯誤：找不到專案"));

        if (!project.getMember().getId().equals(member.getId())) {
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
        Member member = memberRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("錯誤：找不到會員"));

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("錯誤：找不到專案"));

        if (!project.getMember().getId().equals(member.getId())) {
            throw new RuntimeException("錯誤：您沒有權限刪除此專案");
        }

        projectRepository.delete(project);

        return ResponseEntity.ok().build();
    }
}
