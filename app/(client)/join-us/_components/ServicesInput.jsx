"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function ServicesInput({ services, setValue }) {
  const [newService, setNewService] = useState("");
  const [isAddingService, setIsAddingService] = useState(false);

  const addService = () => {
    setIsAddingService(true);
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

  return (
    <div className="space-y-4">
      <Label>Services Offered *</Label>

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
        />
        <Button
          type="button"
          onClick={addService}
          variant="outline"
          disabled={isAddingService}
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
