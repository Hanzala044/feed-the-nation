import { memo } from "react";
import { CheckCircle, Clock, Truck, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineProps {
  status: string;
  createdAt: string;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
}

export const DonationTimeline = memo(({ status, createdAt, pickedUpAt, deliveredAt }: TimelineProps) => {
  const stages = [
    { 
      key: "pending", 
      label: "Posted", 
      icon: Package, 
      time: createdAt,
      active: true 
    },
    { 
      key: "accepted", 
      label: "Accepted", 
      icon: Clock, 
      time: pickedUpAt,
      active: ["accepted", "in_transit", "delivered"].includes(status) 
    },
    { 
      key: "in_transit", 
      label: "In Transit", 
      icon: Truck, 
      time: pickedUpAt,
      active: ["in_transit", "delivered"].includes(status) 
    },
    { 
      key: "delivered", 
      label: "Delivered", 
      icon: CheckCircle, 
      time: deliveredAt,
      active: status === "delivered" 
    },
  ];

  return (
    <div className="relative py-4">
      <div className="flex justify-between items-start">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isLast = index === stages.length - 1;
          
          return (
            <div key={stage.key} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all",
                    stage.active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                
                <p className={cn(
                  "text-xs mt-2 text-center font-medium",
                  stage.active ? "text-foreground" : "text-muted-foreground"
                )}>
                  {stage.label}
                </p>
                
                {stage.time && stage.active && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(stage.time).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "absolute top-5 left-1/2 w-full h-0.5 -z-0 transition-all",
                    stage.active && stages[index + 1].active
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                  style={{ transform: 'translateY(-50%)' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
DonationTimeline.displayName = "DonationTimeline";
