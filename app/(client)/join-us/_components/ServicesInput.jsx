"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ServicesInput({
  services,
  setValue,
  maxServices = Infinity,
  planName = "Free Starter",
}) {
  const [newService, setNewService] = useState("");
  const [isAddingService, setIsAddingService] = useState(false);

  const addService = () => {
    setIsAddingService(true);
    if (services.length >= maxServices) {
      toast.error(
        `${planName} plan allows a maximum of ${maxServices} services`
      );
      setIsAddingService(false);
      return;
    }

    if (newService.trim() && !services.includes(newService.trim())) {
      setValue("services", [...services, newService.trim()]);
      setNewService("");
      toast.success("Service added successfully!");
    } else if (newService.trim() === "") {
      toast.error("Please enter a service name");
    } else if (services.includes(newService.trim())) {
      toast.error("This service is already added");
    }
    setTimeout(() => setIsAddingService(false), 300);
  };

  const removeService = (service) => {
    setValue(
      "services",
      services.filter((s) => s !== service)
    );
    toast.info(`"${service}" removed`);
  };

  const remainingServices = maxServices - services.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Services Offered *</Label>
        {maxServices !== Infinity && (
          <span className="text-xs text-muted-foreground">
            {remainingServices} of {maxServices} services remaining
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={newService}
          onChange={(e) => setNewService(e.target.value)}
          placeholder="Add a service (e.g., Web Development)"
          className={`border-blue-100 focus:border-blue-200 transition-all ${
            newService.trim() ? "border-blue-300" : ""
          }`}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addService();
            }
          }}
          disabled={services.length >= maxServices}
        />
        <Button
          type="button"
          onClick={addService}
          variant="outline"
          disabled={isAddingService || services.length >= maxServices}
          className="border-blue-100 hover:border-blue-200 text-blue-600 hover:text-blue-500 hover:bg-blue-100 cursor-pointer transition-all duration-200 relative"
        >
          {isAddingService ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          ) : (
            <Plus
              className={`h-4 w-4 ${newService.trim() ? "scale-110" : ""} transition-transform`}
            />
          )}
        </Button>
      </div>

      {services.length >= maxServices && maxServices !== Infinity && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-md text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>Maximum services limit reached for {planName} plan</span>
        </div>
      )}

      {services.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {services.map((service, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-blue-100 text-blue-600 hover:bg-blue-200 pr-1 transition-all duration-200 animate-fadeIn"
            >
              {service}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeService(service)}
                className="h-4 w-4 p-0 ml-2 hover:bg-transparent text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
