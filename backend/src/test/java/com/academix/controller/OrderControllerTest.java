package com.academix.controller;

import com.academix.dto.request.OrderRequest;
import com.academix.dto.response.OrderResponse;
import com.academix.model.User;
import com.academix.repository.UserRepository;
import com.academix.service.OrderService;
import com.academix.service.PricingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.academix.security.JwtAuthFilter;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(OrderController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for pure controller logic testing
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private OrderService orderService;

    @MockBean
    private PricingService pricingService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User studentA;
    private User studentB;

    @BeforeEach
    void setUp() {
        studentA = new User();
        studentA.setId(101L);
        studentA.setEmail("studentA@test.com");

        studentB = new User();
        studentB.setId(102L);
        studentB.setEmail("studentB@test.com");

        when(userRepository.findByEmail("studentA@test.com")).thenReturn(Optional.of(studentA));
        when(userRepository.findByEmail("studentB@test.com")).thenReturn(Optional.of(studentB));
    }

    @Test
    @WithMockUser(username = "studentA@test.com", roles = "STUDENT")
    void studentASeesOnlyStudentAOrders() throws Exception {
        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setId(1L);
        when(orderService.getOrdersByStudent(101L)).thenReturn(Arrays.asList(orderResponse));

        mockMvc.perform(get("/orders").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(1));

        verify(orderService, times(1)).getOrdersByStudent(101L);
        verify(orderService, never()).getOrdersByStudent(102L);
    }

    @Test
    @WithMockUser(username = "studentB@test.com", roles = "STUDENT")
    void studentBSeesOnlyStudentBOrders() throws Exception {
        OrderResponse orderResponse = new OrderResponse();
        orderResponse.setId(2L);
        when(orderService.getOrdersByStudent(102L)).thenReturn(Arrays.asList(orderResponse));

        mockMvc.perform(get("/orders").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value(2));

        verify(orderService, times(1)).getOrdersByStudent(102L);
        verify(orderService, never()).getOrdersByStudent(101L);
    }

    @Test
    @WithMockUser(username = "studentA@test.com", roles = "STUDENT")
    void createdOrderAssociatedWithStudentA() throws Exception {
        OrderRequest request = new OrderRequest();
        request.setTitle("Test Order");
        request.setPages(5);
        request.setUrgency(com.academix.enums.Urgency.NORMAL);
        request.setWorkType(com.academix.enums.WorkType.HANDWRITTEN);
        request.setOrderType(com.academix.enums.OrderType.ASSIGNMENT);

        OrderResponse response = new OrderResponse();
        response.setId(10L);

        when(orderService.createOrder(eq(101L), any(OrderRequest.class))).thenReturn(response);

        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(10));

        verify(orderService, times(1)).createOrder(eq(101L), any(OrderRequest.class));
        verify(orderService, never()).createOrder(eq(102L), any(OrderRequest.class));
    }
}
