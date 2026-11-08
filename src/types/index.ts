export type TabType = 
  | 'faq'
  | 'download-ipay'
  | 'game'
  | 'savings'
  | 'loan'
  | 'featured'
  | 'branches';

export interface Advisor {
  name: string;
  title: string;
  phone: string;
  displayPhone: string;
}

export interface StepItem {
  step: number;
  title: string;
  content: string;
  image: string;
}

export type FaqStep = StepItem;

export interface FaqItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  steps: StepItem[];
}

export interface TermRate {
  months: number;
  rate: number;
  label: string;
}

export interface ProductItem {
  id: string;
  category: string;
  title: string;
  categoryLabel: string;
  image: string;
  summary: string;
  highlights: string[];
}

export interface BranchLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  googleMapsUrl: string;
  isHeadquarters: boolean;
}

export type LocationItem = BranchLocation;

export interface BranchGroup {
  id: string;
  name: string;
  province: string;
  locations: BranchLocation[];
}

export type BranchItem = BranchGroup;

export interface RepaymentPeriod {
  periodNumber: number;
  paymentDate: string;
  beginningBalance: number;
  principal: number;
  interest: number;
  totalPayment: number;
  endingBalance: number;
}

export type LoanScheduleRow = RepaymentPeriod;
