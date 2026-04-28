// src/services/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
});

// 1. Analyze CSV for bias
export const analyzeCSV = async (
  file: File,
  targetCol: string,
  sensitiveCol: string
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_col', targetCol);
  formData.append('sensitive_col', sensitiveCol);

  const res = await API.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

// 2. Get all past reports (History page)
export const getReports = async () => {
  const res = await API.get('/reports');
  return res.data.reports;
};

// 3. Get one report by ID
export const getReport = async (id: string) => {
  const res = await API.get(`/reports/${id}`);
  return res.data;
};

// 4. Download debiased CSV
export const downloadCleanCSV = async (
  file: File,
  sensitiveCol: string
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sensitive_col', sensitiveCol);

  const res = await API.post('/download-clean', formData, {
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `clean_${file.name}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};