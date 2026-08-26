import { connectDB } from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import Hero from "@/models/Hero";
import About from "@/models/About";
import Service from "@/models/Service";
import Product from "@/models/Product";
import TeamMember from "@/models/TeamMember";
import Testimonial from "@/models/Testimonial";
import JobPosting from "@/models/JobPosting";
import Application from "@/models/Application";

function serialize(value) {
  return JSON.parse(JSON.stringify(value));
}

async function safe(fn, fallback) {
  try {
    await connectDB();
    const result = await fn();
    return result === null || result === undefined ? result : serialize(result);
  } catch (err) {
    console.error("[data] query failed:", err.message);
    return fallback;
  }
}

export function getSiteSettings() {
  return safe(async () => {
    const doc = await SiteSettings.findOne({ singleton: "main" }).lean();
    return doc || null;
  }, null);
}

export function getHero() {
  return safe(async () => {
    const doc = await Hero.findOne({ singleton: "main" }).lean();
    return doc || null;
  }, null);
}

export function getAbout() {
  return safe(async () => {
    const doc = await About.findOne({ singleton: "main" }).lean();
    return doc || null;
  }, null);
}

export function getServices() {
  return safe(async () => {
    const docs = await Service.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return docs;
  }, []);
}

export function getServiceBySlug(slug) {
  return safe(async () => {
    const doc = await Service.findOne({ slug }).lean();
    return doc || null;
  }, null);
}

export function getProducts() {
  return safe(async () => {
    const docs = await Product.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return docs;
  }, []);
}

export function getProductBySlug(slug) {
  return safe(async () => {
    const doc = await Product.findOne({ slug }).lean();
    return doc || null;
  }, null);
}

export function getTeam() {
  return safe(async () => {
    const docs = await TeamMember.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return docs;
  }, []);
}

export function getTestimonials() {
  return safe(async () => {
    const docs = await Testimonial.find({}).sort({ order: 1, createdAt: 1 }).lean();
    return docs;
  }, []);
}

export function getOpenJobPostings() {
  return safe(async () => {
    const docs = await JobPosting.find({ status: "open" }).sort({ order: 1, createdAt: -1 }).lean();
    return docs;
  }, []);
}

export function getJobPostingBySlug(slug) {
  return safe(async () => {
    const doc = await JobPosting.findOne({ slug }).lean();
    return doc || null;
  }, null);
}

export function hasCandidateApplied(candidateId, jobId) {
  return safe(async () => {
    const doc = await Application.findOne({ candidate: candidateId, job: jobId }).lean();
    return Boolean(doc);
  }, false);
}
