package com.academix.service;

import com.academix.dto.request.AssignWriterRequest;
import com.academix.enums.*;
import com.academix.exception.BadRequestException;
import com.academix.model.Assignment;
import com.academix.model.Order;
import com.academix.model.User;
import com.academix.model.WriterProfile;
import com.academix.repository.AssignmentRepository;
import com.academix.repository.OrderRepository;
import com.academix.repository.UserRepository;
import com.academix.repository.WriterProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class WriterAssignmentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private WriterProfileRepository writerProfileRepository;

    @InjectMocks
    private WriterAssignmentService writerAssignmentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void assignOrderToWriter_Success() {
        Long orderId = 1L;
        Long writerId = 2L;
        AssignWriterRequest request = new AssignWriterRequest(writerId, new BigDecimal("100.00"));

        Order order = new Order();
        order.setId(orderId);
        order.setStatus(OrderStatus.PENDING);

        User writer = new User();
        writer.setId(writerId);
        writer.setRole(Role.WRITER);

        WriterProfile profile = new WriterProfile();
        profile.setAvailability(true);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(userRepository.findById(writerId)).thenReturn(Optional.of(writer));
        when(writerProfileRepository.findByUserId(writerId)).thenReturn(Optional.of(profile));
        when(assignmentRepository.existsByOrderIdAndStatusIn(any(), any())).thenReturn(false);

        writerAssignmentService.assignOrderToWriter(orderId, request);

        verify(assignmentRepository, times(1)).save(any(Assignment.class));
        verify(orderRepository, times(1)).save(order);
        assertEquals(OrderStatus.ASSIGNED, order.getStatus());
        assertEquals(writer, order.getWriter());
    }

    @Test
    void assignOrderToWriter_Fail_NonWriter() {
        Long orderId = 1L;
        Long writerId = 2L;
        AssignWriterRequest request = new AssignWriterRequest(writerId, BigDecimal.ZERO);

        Order order = new Order();
        User writer = new User();
        writer.setRole(Role.STUDENT);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(userRepository.findById(writerId)).thenReturn(Optional.of(writer));

        assertThrows(BadRequestException.class, () -> writerAssignmentService.assignOrderToWriter(orderId, request));
    }

    @Test
    void updateAssignmentStatus_InProgress_Success() {
        Long assignmentId = 1L;
        Assignment assignment = new Assignment();
        assignment.setStatus(AssignmentStatus.PENDING);
        Order order = new Order();
        assignment.setOrder(order);

        when(assignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));

        writerAssignmentService.updateAssignmentStatus(assignmentId, OrderStatus.IN_PROGRESS);

        assertEquals(AssignmentStatus.IN_PROGRESS, assignment.getStatus());
        assertEquals(OrderStatus.IN_PROGRESS, order.getStatus());
        assertNotNull(assignment.getStartedAt());
    }

    @Test
    void toggleWriterAvailability_Success() {
        Long writerId = 1L;
        WriterProfile profile = new WriterProfile();
        profile.setAvailability(true);

        when(writerProfileRepository.findByUserId(writerId)).thenReturn(Optional.of(profile));

        writerAssignmentService.toggleWriterAvailability(writerId);

        assertFalse(profile.getAvailability());
        verify(writerProfileRepository, times(1)).save(profile);
    }
}
