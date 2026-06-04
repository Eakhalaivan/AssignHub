package com.academix.dto.mapper;

import com.academix.dto.response.OrderResponse;
import com.academix.model.Order;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public abstract class OrderMapper {

    public static final OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);

    @Mapping(target = "organizationId", source = "organization.id")
    @Mapping(target = "organizationName", source = "organization.name")
    @Mapping(target = "writerId", source = "writer.id")
    @Mapping(target = "writerName", source = "writer.name")
    @Mapping(target = "fileUrl", source = "fileUrls")
    @Mapping(target = "writerRating", ignore = true)
    @Mapping(target = "distanceKm", ignore = true)
    @Mapping(target = "matchedWriters", ignore = true)
    public abstract OrderResponse toResponse(Order order);

    @AfterMapping
    protected void handleTitleAndDefaults(Order order, @MappingTarget OrderResponse response) {
        if (response.getTitle() == null || response.getTitle().isBlank()) {
            response.setTitle("Order #" + order.getId());
        }
    }
}
