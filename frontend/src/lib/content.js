import doctor1 from "../assets/doctor1.webp";
import doctor2 from "../assets/doctor2.webp";
import doctor3 from "../assets/doctor3.webp";

// Fictional team of the demo clinic
export const doctors = [
  { name: "Dr. Sarah Bensalem", role: "Radiologist", bio: "Reads chest X-rays and reviews every scan the AI flags.", photo: doctor1 },
  { name: "Dr. Yacine Mechri", role: "Pulmonologist", bio: "Follows patients with pneumonia and other lung infections.", photo: doctor2 },
  { name: "Dr. Amina Lounis", role: "General practitioner", bio: "First point of contact for symptoms and follow-up visits.", photo: doctor3 },
];

export const steps = [
  { title: "Upload your X-ray", text: "A JPEG or PNG of a frontal chest X-ray, straight from your phone or computer." },
  { title: "The model reads it", text: "The image is converted to 150 × 150 grayscale and passed through the CNN in about a second." },
  { title: "Get a result and a report", text: "See the result with the model's confidence, and download a PDF report." },
  { title: "Talk to a doctor", text: "Book a consultation to have the result confirmed by a physician." },
];

// Figures from backend/model/LastTimeTraining2.ipynb
export const modelFacts = [
  { value: "4", label: "convolution blocks (16 → 128 filters)" },
  { value: "900k", label: "trainable parameters" },
  { value: "15", label: "training epochs" },
  { value: "150 px", label: "grayscale input" },
];
