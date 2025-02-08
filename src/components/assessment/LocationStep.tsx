
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import countries from "../../data/countries.json";

interface LocationStepProps {
  location: {
    country: string;
    province: string;
    city: string;
  };
  setLocation: (location: { country: string; province: string; city: string }) => void;
}

const LocationStep = ({ location, setLocation }: LocationStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select
          value={location.country}
          onValueChange={(value) =>
            setLocation({ ...location, country: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.name}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="province">State/Province</Label>
        <Input
          id="province"
          placeholder="Enter your state or province"
          value={location.province}
          onChange={(e) =>
            setLocation({ ...location, province: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          placeholder="Enter your city"
          value={location.city}
          onChange={(e) => setLocation({ ...location, city: e.target.value })}
        />
      </div>
    </div>
  );
};

export default LocationStep;
