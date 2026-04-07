package org.spring.profileservice.controller;

import org.mapstruct.control.MappingControl;
import org.spring.profileservice.dto.UserRegistrationRequest;
import org.spring.profileservice.dto.UserResponse;
import org.spring.profileservice.dto.UserUpdateRequest;
import org.spring.profileservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path="/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(value = "/", consumes = "application/json")
    public ResponseEntity<UserResponse> registerUser(@RequestBody UserRegistrationRequest request){
        UserResponse response = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PutMapping(path = "/{id}", consumes = "application/json")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request){
        UserResponse response = userService.updateUser(request, id);
        return ResponseEntity.ok(response);
    }
    @GetMapping(path = "/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id){
        UserResponse response = userService.getUser(id);
        return ResponseEntity.ok(response);
    }
}
