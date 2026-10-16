export const propertyTypes = ['residential', 'commercial', 'industrial', 'other'] as const;
export type Enquiry = { name: string; email: string; phone: string; property: string; location: string; requirements: string; service: string; timeframe: string; preference: string; estimate: string; source: string; website: string; consent: string };
export type FieldErrors = Partial<Record<keyof Enquiry, string>>;
export function validateEnquiry(input: unknown): { data?: Enquiry; errors: FieldErrors } {
  if (!input || typeof input !== 'object') return { errors: { name: 'Please enter your name.' } };
  const raw = input as Record<string, unknown>;
  const data = Object.fromEntries(['name','email','phone','property','location','requirements','service','timeframe','preference','estimate','source','website','consent'].map(k => [k, typeof raw[k] === 'string' ? raw[k].trim() : ''])) as Enquiry;
  const errors: FieldErrors = {};
  if (data.name.length < 2 || data.name.length > 120) errors.name = 'Enter a name between 2 and 120 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254) errors.email = 'Enter a valid email address.';
  if (data.phone && (!/^[+\d\s().-]{7,30}$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 7)) errors.phone = 'Enter a valid phone number or leave this blank.';
  if (!(propertyTypes as readonly string[]).includes(data.property)) errors.property = 'Choose a property type.';
  if (data.location.length < 2 || data.location.length > 200) errors.location = 'Enter your town, city, or property location.';
  if (data.requirements.length > 3000) errors.requirements = 'Please keep this under 3,000 characters.';
  if (!['installation','survey','maintenance','warranty','renewal'].includes(data.service)) errors.service = 'Choose a service.';
  if (!['exploring','1-3 months','3-6 months','as soon as possible'].includes(data.timeframe)) errors.timeframe = 'Choose a project timeframe.';
  if (!['email','phone','whatsapp'].includes(data.preference)) errors.preference = 'Choose a contact preference.';
  if (data.preference !== 'email' && !data.phone) errors.phone = 'Enter a phone number for your chosen contact method.';
  if (data.consent !== 'yes') errors.consent = 'Please agree to be contacted about this request.';
  if (data.estimate.length > 2000) errors.estimate = 'The estimate is too long. Please restart from the calculator.';
  if (data.source.length > 200) errors.source = 'The source is too long.';
  return { data: Object.keys(errors).length ? undefined : data, errors };
}
