package com.academix.controller;

import com.academix.model.Assignment;
import com.academix.model.User;
import com.academix.repository.UserRepository;
import com.academix.service.WriterAssignmentService;
import com.academix.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.academix.security.JwtAuthFilter;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(WriterController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for pure controller logic testing
public class WriterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private WriterAssignmentService writerAssignmentService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private WalletService walletService;

    private User writerA;
    private User writerB;

    @BeforeEach
    void setUp() {
        writerA = new User();
        writerA.setId(201L);
        writerA.setEmail("writerA@test.com");

        writerB = new User();
        writerB.setId(202L);
        writerB.setEmail("writerB@test.com");

        when(userRepository.findByEmail("writerA@test.com")).thenReturn(Optional.of(writerA));
        when(userRepository.findByEmail("writerB@test.com")).thenReturn(Optional.of(writerB));
    }

    @Test
    @WithMockUser(username = "writerA@test.com", roles = "WRITER")
    void writerAEarningsAndAssignmentsScopedToWriterA() throws Exception {
        when(writerAssignmentService.getAssignmentsByWriter(201L)).thenReturn(Arrays.asList(new Assignment()));

        mockMvc.perform(get("/writer/assignments").with(csrf()))
                .andExpect(status().isOk());

        verify(writerAssignmentService, times(1)).getAssignmentsByWriter(201L);
        verify(writerAssignmentService, never()).getAssignmentsByWriter(202L);
    }

    @Test
    @WithMockUser(username = "writerB@test.com", roles = "WRITER")
    void writerBSeesOnlyWriterBAssignments() throws Exception {
        when(writerAssignmentService.getAssignmentsByWriter(202L)).thenReturn(Arrays.asList(new Assignment()));

        mockMvc.perform(get("/writer/assignments").with(csrf()))
                .andExpect(status().isOk());

        verify(writerAssignmentService, times(1)).getAssignmentsByWriter(202L);
        verify(writerAssignmentService, never()).getAssignmentsByWriter(201L);
    }

    @Test
    @WithMockUser(username = "writerA@test.com", roles = "WRITER")
    void toggleAvailabilityAssociatedWithWriterA() throws Exception {
        mockMvc.perform(put("/writer/availability").with(csrf()))
                .andExpect(status().isOk());

        verify(writerAssignmentService, times(1)).toggleWriterAvailability(201L);
        verify(writerAssignmentService, never()).toggleWriterAvailability(202L);
    }

    @Test
    @WithMockUser(username = "writerA@test.com", roles = "WRITER")
    void getEarningsLogsSuccessfully() throws Exception {
        com.academix.model.WalletTransaction tx1 = new com.academix.model.WalletTransaction();
        tx1.setAmount(new java.math.BigDecimal("150.00"));
        tx1.setType(com.academix.enums.TransactionType.CREDIT);
        tx1.setReferenceType(com.academix.enums.TransactionReferenceType.WRITER_EARNING);
        tx1.setCreatedAt(java.time.LocalDateTime.now());

        when(walletService.getBalance(201L)).thenReturn(new java.math.BigDecimal("150.00"));
        when(walletService.getTransactionHistory(201L)).thenReturn(java.util.Arrays.asList(tx1));

        mockMvc.perform(get("/writer/earnings").with(csrf()))
                .andExpect(status().isOk());

        verify(walletService, times(1)).getBalance(201L);
        verify(walletService, times(1)).getTransactionHistory(201L);
    }
}
