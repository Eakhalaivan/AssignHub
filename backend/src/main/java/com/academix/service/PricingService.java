package com.academix.service;

import com.academix.dto.response.PricingResponse;
import com.academix.enums.OrderType;
import com.academix.enums.Urgency;
import com.academix.enums.WorkType;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class PricingService {

    public PricingResponse calculatePrice(OrderType orderType, Integer pages, Urgency urgency, WorkType workType, BigDecimal materialCost) {
        return calculatePrice(
                orderType,
                pages,
                urgency,
                workType,
                materialCost,
                orderType != null ? orderType.name() : "ASSIGNMENT",
                "UG",
                0,
                "Simple",
                false,
                BigDecimal.ZERO,
                "None",
                "None",
                "None",
                urgency != null ? urgency.name() : "NORMAL",
                BigDecimal.ZERO,
                BigDecimal.valueOf(15)
        );
    }

    public PricingResponse calculatePrice(
            OrderType fallbackOrderType,
            Integer pages,
            Urgency fallbackUrgency,
            WorkType fallbackWorkType,
            BigDecimal fallbackMaterialCost,
            String serviceType,
            String academicLevel,
            Integer diagramsCount,
            String diagramComplexity,
            Boolean colorDiagrams,
            BigDecimal hardwareComponentsCost,
            String modelType,
            String printingType,
            String bindingType,
            String deliveryPriority,
            BigDecimal deliveryCharge,
            BigDecimal platformCommissionPercent
    ) {
        if (pages == null || pages < 1) pages = 1;
        if (diagramsCount == null || diagramsCount < 0) diagramsCount = 0;
        if (hardwareComponentsCost == null) hardwareComponentsCost = BigDecimal.ZERO;
        if (deliveryCharge == null) deliveryCharge = BigDecimal.ZERO;
        if (platformCommissionPercent == null) platformCommissionPercent = BigDecimal.valueOf(15); // default to 15%

        BigDecimal basePrice = BigDecimal.ZERO;

        // Base Service Cost
        if (serviceType != null) {
            String service = serviceType.trim().toUpperCase();
            if (service.equals("ASSIGNMENT") || service.equals("RECORD NOTE") || service.equals("OBSERVATION RECORD") || service.equals("OBSERVATION") || service.equals("LAB MANUAL") || service.equals("SEMINAR PPT") || service.equals("DIAGRAM")) {
                basePrice = BigDecimal.ZERO;
            } else if (service.equals("MODEL")) {
                String mt = modelType != null ? modelType.trim().toUpperCase() : "";
                if (mt.contains("CHART")) {
                    basePrice = BigDecimal.valueOf(1000);
                } else if (mt.contains("WORKING")) {
                    basePrice = BigDecimal.valueOf(5750);
                } else if (mt.contains("SCIENCE") || mt.contains("EXHIBITION")) {
                    basePrice = BigDecimal.valueOf(11000);
                } else if (mt.contains("ENGINEERING")) {
                    basePrice = BigDecimal.valueOf(27500);
                } else {
                    basePrice = BigDecimal.valueOf(1000); // fallback
                }
            } else if (service.equals("MINI PROJECT") || service.equals("MINI_PROJECT")) {
                String lvl = academicLevel != null ? academicLevel.trim().toUpperCase() : "";
                if (lvl.equals("SCHOOL")) {
                    basePrice = BigDecimal.valueOf(1250);
                } else if (lvl.equals("DIPLOMA")) {
                    basePrice = BigDecimal.valueOf(3250);
                } else if (lvl.equals("UG")) {
                    basePrice = BigDecimal.valueOf(6500);
                } else if (lvl.equals("PG")) {
                    basePrice = BigDecimal.valueOf(12500);
                } else {
                    basePrice = BigDecimal.valueOf(1250); // fallback
                }
            } else if (service.equals("PROJECT DOCUMENTATION") || service.equals("PROJECT_DOCUMENTATION")) {
                basePrice = BigDecimal.valueOf(6500);
            } else if (service.equals("SOFTWARE PROJECT") || service.equals("SOFTWARE_PROJECT")) {
                basePrice = BigDecimal.valueOf(22500);
            } else if (service.equals("HARDWARE PROJECT") || service.equals("HARDWARE_PROJECT")) {
                basePrice = BigDecimal.valueOf(41500);
            } else if (service.equals("IOT PROJECT") || service.equals("IOT_PROJECT")) {
                basePrice = BigDecimal.valueOf(45000);
            } else if (service.equals("AI/ML PROJECT") || service.equals("AI_ML_PROJECT")) {
                basePrice = BigDecimal.valueOf(57500);
            } else if (service.equals("FINAL YEAR PROJECT") || service.equals("FINAL_YEAR_PROJECT")) {
                basePrice = BigDecimal.valueOf(6500); // default to documentation only midpoint as fallback
            }
        } else {
            // Fallback base price based on OrderType
            if (fallbackOrderType == OrderType.FINAL_YEAR_PROJECT) {
                basePrice = BigDecimal.valueOf(6500);
            } else if (fallbackOrderType == OrderType.MINI_PROJECT) {
                basePrice = BigDecimal.valueOf(3250);
            }
        }

        // Page Writing Cost
        BigDecimal writingCostPerPage = BigDecimal.valueOf(50); // default Typed
        if (fallbackWorkType == WorkType.PRINTED) {
            writingCostPerPage = BigDecimal.valueOf(75);
        } else if (fallbackWorkType == WorkType.HANDWRITTEN) {
            writingCostPerPage = BigDecimal.valueOf(115);
        }
        BigDecimal pageWritingCost = writingCostPerPage.multiply(BigDecimal.valueOf(pages));

        // Diagram Cost
        BigDecimal diagramCost = BigDecimal.ZERO;
        if (diagramsCount > 0) {
            BigDecimal diagramCostPerUnit = BigDecimal.valueOf(75); // default Simple
            if (diagramComplexity != null) {
                String comp = diagramComplexity.trim().toUpperCase();
                if (comp.equals("TECHNICAL")) {
                    diagramCostPerUnit = BigDecimal.valueOf(175);
                } else if (comp.equals("ENGINEERING")) {
                    diagramCostPerUnit = BigDecimal.valueOf(350);
                }
            }
            diagramCost = diagramCostPerUnit.multiply(BigDecimal.valueOf(diagramsCount));
            if (Boolean.TRUE.equals(colorDiagrams)) {
                diagramCost = diagramCost.multiply(BigDecimal.valueOf(1.5));
            }
        }

        // Material Cost
        BigDecimal materialCostValue = fallbackMaterialCost != null ? fallbackMaterialCost : BigDecimal.ZERO;

        // Hardware Components Cost (with markup)
        BigDecimal hardwareCostWithMarkup = hardwareComponentsCost.multiply(BigDecimal.valueOf(1.30));

        // Printing Cost
        BigDecimal printingCost = BigDecimal.ZERO;
        if (printingType != null) {
            String pt = printingType.trim().toUpperCase();
            if (pt.equals("BLACK & WHITE") || pt.equals("BLACK_WHITE")) {
                printingCost = BigDecimal.valueOf(3.50).multiply(BigDecimal.valueOf(pages));
            } else if (pt.equals("COLOR")) {
                printingCost = BigDecimal.valueOf(20).multiply(BigDecimal.valueOf(pages));
            }
        }

        // Binding Cost
        BigDecimal bindingCost = BigDecimal.ZERO;
        if (bindingType != null) {
            String bt = bindingType.trim().toUpperCase();
            if (bt.contains("SPIRAL")) {
                bindingCost = BigDecimal.valueOf(100);
            } else if (bt.contains("HARD")) {
                bindingCost = BigDecimal.valueOf(400);
            }
        }

        // Subtotal (Sum of all costs)
        BigDecimal subtotal = basePrice
                .add(pageWritingCost)
                .add(diagramCost)
                .add(materialCostValue)
                .add(hardwareCostWithMarkup)
                .add(printingCost)
                .add(bindingCost)
                .add(deliveryCharge);

        // Priority Surcharge
        BigDecimal priorityPercentage = BigDecimal.ZERO;
        if (deliveryPriority != null) {
            String prio = deliveryPriority.trim().toUpperCase();
            if (prio.contains("PRIORITY")) {
                priorityPercentage = BigDecimal.valueOf(0.25);
            } else if (prio.contains("URGENT")) {
                priorityPercentage = BigDecimal.valueOf(0.50);
            } else if (prio.contains("SAME")) {
                priorityPercentage = BigDecimal.valueOf(0.75);
            } else if (prio.contains("EXPRESS")) {
                priorityPercentage = BigDecimal.valueOf(1.00);
            }
        } else {
            // fallback to urgency
            if (fallbackUrgency == Urgency.URGENT) {
                priorityPercentage = BigDecimal.valueOf(0.50);
            } else if (fallbackUrgency == Urgency.SAME_DAY) {
                priorityPercentage = BigDecimal.valueOf(0.75);
            }
        }
        BigDecimal prioritySurcharge = subtotal.multiply(priorityPercentage);

        // Platform Commission
        BigDecimal commissionPercentageDecimal = platformCommissionPercent.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
        BigDecimal platformCommission = subtotal.add(prioritySurcharge).multiply(commissionPercentageDecimal);

        // Grand Total
        BigDecimal grandTotal = subtotal.add(prioritySurcharge).add(platformCommission).setScale(2, java.math.RoundingMode.HALF_UP);

        return new PricingResponse(subtotal, prioritySurcharge, grandTotal);
    }
}
