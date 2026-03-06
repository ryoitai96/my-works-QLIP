import { apiClient } from '../../lib/api-client';

export interface CharacteristicProfileData {
  id: string;
  memberId: string;
  visualCognition: number | null;
  auditoryCognition: number | null;
  dexterity: number | null;
  physicalEndurance: number | null;
  repetitiveWorkTolerance: number | null;
  adaptability: number | null;
  interpersonalCommunication: number | null;
  concentrationDuration: number | null;
  stressTolerance: number | null;
  specialNotes: string | null;
  clinicSchedule: string | null;
  medicationTiming: string | null;
  environmentAccommodation: string | null;
  communicationAccommodation: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertCharacteristicProfilePayload {
  visualCognition?: number | null;
  auditoryCognition?: number | null;
  dexterity?: number | null;
  physicalEndurance?: number | null;
  repetitiveWorkTolerance?: number | null;
  adaptability?: number | null;
  interpersonalCommunication?: number | null;
  concentrationDuration?: number | null;
  stressTolerance?: number | null;
  specialNotes?: string | null;
  clinicSchedule?: string | null;
  medicationTiming?: string | null;
  environmentAccommodation?: string | null;
  communicationAccommodation?: string | null;
}

export async function fetchCharacteristicProfile(
  memberId: string,
): Promise<CharacteristicProfileData | null> {
  return apiClient<CharacteristicProfileData | null>(
    `/characteristic-profiles/${memberId}`,
    { auth: true },
  );
}

export async function upsertCharacteristicProfile(
  memberId: string,
  payload: UpsertCharacteristicProfilePayload,
): Promise<CharacteristicProfileData> {
  return apiClient<CharacteristicProfileData>(
    `/characteristic-profiles/${memberId}`,
    { method: 'PUT', body: payload, auth: true },
  );
}
