//package integration;
//
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.web.servlet.MockMvc;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import ua.tqs.dto.AuthRequest;
//
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@SpringBootTest(classes = ua.tqs.EletricNET_BackendApplication.class)
//@AutoConfigureMockMvc
//@AutoConfigureTestDatabase
//class AuthControllerIT {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @Test
//    void testLoginWithValidCredentials() throws Exception {
//        AuthRequest request = new AuthRequest();
//        request.setUsername("admin");
//        request.setPassword("adminpass");
//
//        mockMvc.perform(post("/api/auth/login")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.token").exists());
//    }
//
//    @Test
//    void testRegisterNewUser() throws Exception {
//        AuthRequest request = new AuthRequest();
//        request.setUsername("newuser");
//        request.setPassword("password");
//        request.setName("John Doe");
//        request.setRole("USER");
//
//        mockMvc.perform(post("/api/auth/register")
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(request)))
//                .andExpect(status().isOk());
//    }
//}