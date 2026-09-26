import os
import math
import subprocess

os.makedirs('/tmp/frames', exist_ok=True)

# Generate 73 frames (0h to 72h)
for hr in range(73):
    t = hr / 72.0
    
    # Drift vector: 45 deg (northeast)
    # Movement distance in pixels: 0 to 180px
    drift_dist = t * 180.0
    # In SVG (0,0 is top-left), moving 45 deg NE means +dx, -dy
    dx = drift_dist * 0.707
    dy = -drift_dist * 0.707
    cx = 360 + dx
    cy = 360 + dy
    
    # Dynamic expansion factors
    # Outer amber boundary: rx starts 90 -> 270, ry starts 52 -> 155
    rx_out = 90 + t * 180
    ry_out = 52 + t * 105
    rx_mid = 68 + t * 125
    ry_mid = 36 + t * 70
    rx_in = 46 + t * 75
    ry_in = 22 + t * 38
    
    # Generate organic lobes
    def get_poly(rx, ry, harmonics, num_pts=48):
        pts = []
        for i in range(num_pts):
            theta = (i / num_pts) * 2 * math.pi
            wave = 1.0
            for freq, amp, phase in harmonics:
                wave += amp * math.sin(theta * freq + phase + t * 3.0)
            
            # Flank fissures (lateral tears developing as t increases)
            fissure = 0.22 * (math.sin(theta)**4) * (0.2 + 0.8 * t)
            wave -= fissure
            
            px = rx * wave * math.cos(theta)
            py = ry * wave * math.sin(theta)
            
            # Rotate by vessel angle 38 deg (0.66 rad)
            rot = -0.66
            rx_rot = px * math.cos(rot) - py * math.sin(rot)
            ry_rot = px * math.sin(rot) + py * math.cos(rot)
            
            pts.append(f"{cx + rx_rot:.1f},{cy + ry_rot:.1f}")
        return " ".join(pts)

    poly_out = get_poly(rx_out, ry_out, [(3, 0.12, 0.5), (5, 0.09, 1.2), (7, 0.05, 2.1)])
    poly_mid = get_poly(rx_mid, ry_mid, [(3, 0.10, 0.4), (5, 0.07, 0.9)])
    poly_in  = get_poly(rx_in,  ry_in,  [(3, 0.08, 0.3), (4, 0.05, 0.7)])

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width="720" height="720">
      <rect width="720" height="720" fill="#07111a"/>
      
      <!-- Tier 1: Outer Sheen / Golden Amber -->
      <polygon points="{poly_out}" fill="#f59e0b" fill-opacity="0.88" stroke="#fbbf24" stroke-width="2"/>
      
      <!-- Tier 2: Mid Mousse / Fiery Vermilion -->
      <polygon points="{poly_mid}" fill="#ea580c" fill-opacity="0.94" stroke="#f97316" stroke-width="2"/>
      
      <!-- Tier 3: Core Crimson -->
      <polygon points="{poly_in}" fill="#7f1d1d" fill-opacity="0.98" stroke="#dc2626" stroke-width="1.8"/>
      
      <!-- Vessel (Centered on cx, cy with heading 38 deg) -->
      <g transform="translate({cx:.1f}, {cy:.1f}) rotate(38)">
        <!-- Hull with Cyan Glow -->
        <path d="M -38 0 L -26 -10 L 28 -10 L 38 0 L 28 10 L -26 10 Z" fill="#081422" stroke="#00e5ff" stroke-width="2.2"/>
        <!-- Cargo Tanks -->
        <rect x="-22" y="-7" width="8" height="14" rx="1" fill="#112235" stroke="#38bdf8" stroke-width="0.8"/>
        <rect x="-11" y="-7" width="8" height="14" rx="1" fill="#112235" stroke="#38bdf8" stroke-width="0.8"/>
        <!-- Ruptured Tank #3 (Red) -->
        <rect x="0" y="-8" width="10" height="16" rx="1.5" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.5"/>
        <line x1="5" y1="-8" x2="5" y2="8" stroke="#ffffff" stroke-width="0.8" stroke-dasharray="1,1"/>
        <!-- Tank #4 -->
        <rect x="13" y="-7" width="8" height="14" rx="1" fill="#112235" stroke="#38bdf8" stroke-width="0.8"/>
        <!-- Wheelhouse & Catwalk -->
        <rect x="22" y="-7" width="9" height="14" rx="1.5" fill="#1e293b" stroke="#94a3b8" stroke-width="1"/>
        <circle cx="28" cy="0" r="1.8" fill="#f59e0b"/>
        <!-- Bow Light (Green) -->
        <circle cx="-34" cy="0" r="1.8" fill="#22c55e"/>
      </g>
    </svg>"""

    with open(f"/tmp/frames/frame_{hr:03d}.svg", "w") as f:
        f.write(svg)

print("SVGs generated. Compiling mp4 with ffmpeg...")
cmd = [
    'ffmpeg', '-y',
    '-framerate', '18',
    '-i', '/tmp/frames/frame_%03d.svg',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    'public/assets/simulation_evolution.mp4'
]
subprocess.run(cmd, check=True)
print("Simulation evolution video compiled successfully at public/assets/simulation_evolution.mp4!")
