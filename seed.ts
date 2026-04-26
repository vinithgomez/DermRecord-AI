import { supabase } from "./src/server/db.js";

async function seed() {
  console.log("Seeding data...");
  
  // Create a patient
  const { data: patient, error } = await supabase.from('patients').insert([
    {
      first_name: "John",
      last_name: "Doe",
      date_of_birth: "1985-06-15",
      gender: "male",
      contact_number: "555-0123",
      email: "john.doe@example.com"
    },
    {
      first_name: "Jane",
      last_name: "Smith",
      date_of_birth: "1992-11-20",
      gender: "female",
      contact_number: "555-0987",
      email: "jane.smith@example.com"
    }
  ]).select();

  if (error) {
    console.error("Error seeding patients:", error);
  } else {
    console.log("Seeded patients:", patient);
  }
}

seed();
