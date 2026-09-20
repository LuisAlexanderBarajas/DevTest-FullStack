package com.katamid.backend.config;

import com.katamid.backend.auth.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String username = jwtUtil.extractUsername(jwt);
            final String role = jwtUtil.extractRole(jwt);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtUtil.isTokenValid(jwt)) {

                    String springRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            List.of(new SimpleGrantedAuthority(springRole))
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Si alguien alteró el token en el navegador, jjwt lanzará una excepción de firma inválida.
        }

        chain.doFilter(request, response);
    }
}