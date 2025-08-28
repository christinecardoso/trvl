---
title: Untitled
draft: true
---
Great question 👍

In your current setup with the **relations plugin**, the distinction between `kind: "destination"` and `kind: "activity"` usually comes down to **what role the entry plays in your content graph**. Think of it like this:

---

### 🔹 `kind: "destination"`

- A **place** you go to or base yourself in.
    
- Typically has multiple activities or experiences associated with it.
    
- Examples:
    
    - Quito
        
    - Mindo Cloud Forest
        
    - Papallacta Hot Springs (the town/complex itself)
        
    - Quilotoa Crater Lake
        

These serve as **anchor points** in your site structure. Activities “attach” to destinations via `destination_slug`.

---

### 🔹 `kind: "activity"`

- A **thing you do** at, or near, a destination.
    
- Can be a hike, tour, food experience, or cultural visit.
    
- Examples:
    
    - “Hike the Quilotoa Crater Rim”
        
    - “Ziplining in Mindo”
        
    - “Chocolate Tour in Mindo”
        
    - “Papallacta Waterfall Hike”
        

Activities often include details like difficulty, duration, gear, etc. They can **relate back** to one or more destinations.

---

### ✅ How it applies to your examples

- **Papallacta Hot Springs** → `kind: destination` (because the place is the draw; you could also list lodging, spa, and hikes around it).
    
- **Soaking in Thermal Pools** → `kind: activity` (a specific action/experience at Papallacta).
    
- **Papallacta Waterfall Trail** → `kind: activity`.
    

---

👉 So, in short:

- Use **`destination`** for **places** (towns, sites, regions, hubs).
    
- Use **`activity`** for **doable things** within or nearby.
    

Do you want me to help you split your existing entries (like _Mindo_, _Quilotoa_, _Papallacta_) into **one “destination” page each**, with linked **activities under them** so your relations system shows off properly?