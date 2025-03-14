"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Form validation schema
const profileSetupSchema = z.object({
  age: z.string().min(1, { message: "Please select your age range" }),
  ethnicity: z.string().min(1, { message: "Please select your ethnicity" }),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isKosher: z.boolean().default(false),
  isHalal: z.boolean().default(false),
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.string().optional(),
  privacyLevel: z.enum(["PRIVATE", "PARTIAL", "PUBLIC"]),
  city: z.string().min(1, { message: "Please enter your city" }),
  state: z.string().min(1, { message: "Please select your state" }),
  zip: z.string().min(5, { message: "Please enter a valid ZIP code" }),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

// Mock data for form options
const ageRanges = [
  "18-24", "25-34", "35-44", "45-54", "55-64", "65+"
];

const ethnicities = [
  "Asian", "Black or African American", "Hispanic or Latino", 
  "Middle Eastern or North African", "Native American or Alaska Native", 
  "Native Hawaiian or Pacific Islander", "White", "Multiracial", "Other"
];

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const dietaryRestrictions = [
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "dairy-free", label: "Dairy-Free" },
  { id: "nut-free", label: "Nut-Free" },
  { id: "soy-free", label: "Soy-Free" },
  { id: "shellfish-free", label: "Shellfish-Free" },
  { id: "low-carb", label: "Low-Carb" },
];

export function ProfileSetupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form
  const form = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      age: "",
      ethnicity: "",
      isVegetarian: false,
      isVegan: false,
      isKosher: false,
      isHalal: false,
      dietaryRestrictions: [],
      allergies: "",
      privacyLevel: "PARTIAL",
      city: "",
      state: "",
      zip: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: ProfileSetupFormValues) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API to save the profile
      console.log("Profile data:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Profile completed successfully!");
      router.push("/map");
    } catch (error) {
      console.error("Profile setup error:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Demographics Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Demographics</h2>
            <p className="text-sm text-muted-foreground">
              This information helps us connect you with businesses and reviews that are most relevant to you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Range</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ageRanges.map((age) => (
                          <SelectItem key={age} value={age}>
                            {age}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ethnicity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ethnicity</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ethnicity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ethnicities.map((ethnicity) => (
                          <SelectItem key={ethnicity} value={ethnicity}>
                            {ethnicity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Dietary Preferences Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Dietary Preferences</h2>
            <p className="text-sm text-muted-foreground">
              Help us find food establishments that match your dietary needs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isVegetarian"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Vegetarian</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isVegan"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Vegan</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isKosher"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Kosher</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isHalal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Halal</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Other Dietary Restrictions</FormLabel>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {dietaryRestrictions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="dietaryRestrictions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., peanuts, shellfish, etc." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Separate multiple allergies with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Location Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Location</h2>
            <p className="text-sm text-muted-foreground">
              Help us find businesses near you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Your city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          
          {/* Privacy Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Privacy Settings</h2>
            <p className="text-sm text-muted-foreground">
              Control how much of your demographic information is shared with other users.
            </p>
            
            <FormField
              control={form.control}
              name="privacyLevel"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="PRIVATE" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Private - Only show that a review was written by a verified user
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="PARTIAL" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Partial - Show general demographic info (age range, dietary preferences)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="PUBLIC" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Public - Share all demographic information with other users
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving Profile..." : "Complete Profile"}
          </Button>
        </form>
      </Form>
    </Card>
  );
} 