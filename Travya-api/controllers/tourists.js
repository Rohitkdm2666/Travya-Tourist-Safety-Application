import { z } from "zod";
import { supabase } from "../supabaseClient.js";

const emergencyContactSchema = z.object({
    name: z.string().min(1),
    phoneNo: z.string().min(5),
    relationship: z.string().min(1)
});

const itineraryItemSchema = z.object({
    location: z.string().min(1),
    date: z.string().min(1),
    activity: z.string().min(1)
});

const touristSchema = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phoneNo: z.string().min(5),
    nationality: z.string().min(1),
    documentType: z.string().min(1),
    documentNo: z.string().min(1),
    registrationPoint: z.string().min(1),
    checkInDate: z.string().min(1),
    checkOutDate: z.string().min(1),
    emergencyContacts: z.array(emergencyContactSchema).min(1),
    travelItinerary: z.array(itineraryItemSchema).min(1)
});

function bufferToFile(buffer, filename, mimetype) {
    return new File([buffer], filename, { type: mimetype });
}

export async function registerTourist(req, res) {
    try {
        const body = JSON.parse(req.body.data || "{}");
        const parsed = touristSchema.safeParse(body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
        }

        const files = req.files || {};
        const photoFile = files.photo?.[0];
        const documentPhotoFile = files.documentPhoto?.[0];

        // Upload files to Supabase Storage if present
        let photoUrl = null;
        let documentPhotoUrl = null;
        if (photoFile) {
            const path = `photos/${Date.now()}_${photoFile.originalname}`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from("tourist-assets")
                .upload(path, photoFile.buffer, { contentType: photoFile.mimetype, upsert: false });
            if (uploadError) return res.status(500).json({ error: "Photo upload failed", details: uploadError.message });
            const { data: publicUrl } = supabase.storage.from("tourist-assets").getPublicUrl(uploadData.path);
            photoUrl = publicUrl.publicUrl;
        }

        if (documentPhotoFile) {
            const path = `documents/${Date.now()}_${documentPhotoFile.originalname}`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from("tourist-assets")
                .upload(path, documentPhotoFile.buffer, { contentType: documentPhotoFile.mimetype, upsert: false });
            if (uploadError) return res.status(500).json({ error: "Document photo upload failed", details: uploadError.message });
            const { data: publicUrl } = supabase.storage.from("tourist-assets").getPublicUrl(uploadData.path);
            documentPhotoUrl = publicUrl.publicUrl;
        }

        // Insert record into Supabase table
        // Your CREATE TABLE used unquoted identifiers. Postgres lowercases them.
        // So the actual column names are lowercase with no camelCase:
        // e.g., fullName -> fullname, checkInDate -> checkindate
        const safeRow = {
            fullname: parsed.data.fullName,
            email: parsed.data.email,
            phoneno: parsed.data.phoneNo,
            nationality: parsed.data.nationality,
            photo: photoUrl,
            documenttype: parsed.data.documentType,
            documentno: parsed.data.documentNo,
            documentphoto: documentPhotoUrl,
            registrationpoint: parsed.data.registrationPoint,
            checkindate: String(parsed.data.checkInDate).slice(0, 10),
            checkoutdate: String(parsed.data.checkOutDate).slice(0, 10),
            emergencycontacts: parsed.data.emergencyContacts,
            travelitinerary: parsed.data.travelItinerary
        };

        const { data, error } = await supabase
            .from("tourists")
            .insert([safeRow])
            .select()
            .single();
        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(500).json({ error: "Database insert failed", details: error });
        }

        return res.status(201).json({ tourist: data });
    } catch (err) {
        return res.status(500).json({ error: "Unexpected error", details: err.message });
    }
}

export async function listTourists(req, res) {
    try {
        const { data, error } = await supabase
            .from('tourists')
            .select('id, created_at, fullname, email, phoneno, nationality, checkindate, checkoutdate, photo')
            .order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: 'Failed to fetch tourists', details: error.message });
        return res.json({ tourists: data });
    } catch (err) {
        return res.status(500).json({ error: 'Unexpected error', details: err.message });
    }
}

export async function getTouristById(req, res) {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('tourists')
            .select('*')
            .eq('id', id)
            .single();
        if (error) return res.status(404).json({ error: 'Tourist not found', details: error.message });
        return res.json({ tourist: data });
    } catch (err) {
        return res.status(500).json({ error: 'Unexpected error', details: err.message });
    }
}


