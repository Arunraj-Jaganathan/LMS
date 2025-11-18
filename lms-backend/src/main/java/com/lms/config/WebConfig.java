package com.lms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String base = System.getProperty("user.dir") + "/uploads/";

        registry.addResourceHandler("/thumbnails/**")
                .addResourceLocations("file:" + base);

        registry.addResourceHandler("/videos/**")
                .addResourceLocations("file:" + base + "videos/");

        registry.addResourceHandler("/video-thumbnails/**")
                .addResourceLocations("file:" + base + "video-thumbnails/");

        registry.addResourceHandler("/notes/**")
                .addResourceLocations("file:" + base + "notes/");
    }
}
