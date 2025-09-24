import { supabase } from "../supabaseClient.js";

export async function createReport(req, res) {
    try {
        const { areaName, description, latitude, longitude, reporterName, reporterPhone } = req.body || {};
        if (!areaName || !description) {
            return res.status(400).json({ error: "areaName and description are required" });
        }
        const payload = {
            area_name: areaName,
            description,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            reporter_name: reporterName ?? null,
            reporter_phone: reporterPhone ?? null,
            created_at: new Date().toISOString()
        };
        const { data, error } = await supabase.from("reports").insert([payload]).select();
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(201).json({ report: Array.isArray(data) ? data[0] : data });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}

export async function listReports(_req, res) {
    try {
        const { data, error } = await supabase
            .from("reports")
            .select("id, area_name, description, latitude, longitude, reporter_name, reporter_phone, created_at")
            .order("created_at", { ascending: false })
            .limit(100);
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.json({ reports: data || [] });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}



