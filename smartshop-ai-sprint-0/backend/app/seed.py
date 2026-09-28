from .database import (
    Base,
    SessionLocal,
    engine,
)

from .models import Product


# ============================================================
# PRODUCT BUILDER
# ============================================================

def product(
    name,
    description,
    category,
    price,
    colour,
    size,
    store,
    location,
    shipping,
    rating,
    image
):

    return {

        "name":
            name,

        "description":
            description,

        "category":
            category,

        "price":
            price,

        "colour":
            colour,

        "size":
            size,

        "store":
            store,

        "location":
            location,

        "shipping_cost":
            shipping,

        "rating":
            rating,

        "image_url":
            f"/products/{image}.webp"
    }


# ============================================================
# SMARTSHOP CATALOGUE
# 150 PRODUCTS
# ============================================================

PRODUCTS = [

    # ========================================================
    # FITNESS - 10
    # ========================================================

    product(
        "25kg Adjustable Dumbbell",
        "Adjustable home workout dumbbell designed for strength training and compact home gyms.",
        "Fitness",
        549,
        "Black",
        "25kg",
        "Sports Warehouse",
        "Durban",
        60,
        4.7,
        "adjustable-dumbbell"
    ),

    product(
        "Resistance Band Training Set",
        "Five-piece resistance band set for strength, mobility and home fitness training.",
        "Fitness",
        299,
        "Multicolour",
        "5 Piece",
        "Sports Warehouse",
        "Durban",
        45,
        4.5,
        "resistance-band-set"
    ),

    product(
        "Premium Yoga Mat",
        "Comfortable non-slip exercise mat suitable for yoga, stretching and floor workouts.",
        "Fitness",
        349,
        "Purple",
        "Standard",
        "Fitness World",
        "Johannesburg",
        55,
        4.6,
        "premium-yoga-mat"
    ),

    product(
        "20kg Kettlebell",
        "Heavy-duty kettlebell for strength, conditioning and functional fitness workouts.",
        "Fitness",
        649,
        "Black",
        "20kg",
        "Gym Equipment SA",
        "Cape Town",
        80,
        4.8,
        "20kg-kettlebell"
    ),

    product(
        "Adjustable Weight Bench",
        "Multi-position training bench for strength workouts and home gym exercises.",
        "Fitness",
        1899,
        "Black",
        "Standard",
        "Gym Equipment SA",
        "Durban",
        150,
        4.7,
        "weight-bench"
    ),

    product(
        "Skipping Rope Pro",
        "Lightweight speed rope designed for cardio fitness, boxing and conditioning.",
        "Fitness",
        199,
        "Black",
        "Adjustable",
        "Totalsports",
        "Durban",
        35,
        4.4,
        "skipping-rope"
    ),

    product(
        "Foam Roller",
        "Textured recovery roller for muscle release, mobility and post-workout recovery.",
        "Fitness",
        249,
        "Blue",
        "45cm",
        "Fitness World",
        "Cape Town",
        40,
        4.5,
        "foam-roller"
    ),

    product(
        "Push Up Board System",
        "Portable colour-coded push-up board for targeted upper-body training.",
        "Fitness",
        399,
        "Black",
        "Standard",
        "Sports Warehouse",
        "Johannesburg",
        45,
        4.3,
        "push-up-board"
    ),

    product(
        "Fitness Exercise Ball",
        "Anti-burst exercise ball for core workouts, mobility and balance training.",
        "Fitness",
        329,
        "Blue",
        "65cm",
        "Fitness World",
        "Durban",
        50,
        4.4,
        "exercise-ball"
    ),

    product(
        "Home Pull Up Bar",
        "Doorway pull-up bar designed for bodyweight back, arm and core workouts.",
        "Fitness",
        449,
        "Black",
        "Adjustable",
        "Gym Equipment SA",
        "Johannesburg",
        50,
        4.6,
        "pull-up-bar"
    ),


    # ========================================================
    # SHOES - 10
    # ========================================================

    product(
        "Nike Running Shoes",
        "Lightweight running shoes designed for everyday training and comfortable road running.",
        "Shoes",
        899,
        "Black",
        "10",
        "Sportscene",
        "Durban",
        50,
        4.6,
        "nike-running-shoes"
    ),

    product(
        "Adidas Everyday Sneakers",
        "Comfortable casual sneakers suitable for everyday wear, walking and relaxed outfits.",
        "Shoes",
        1099,
        "White",
        "9",
        "Sportscene",
        "Johannesburg",
        60,
        4.7,
        "adidas-sneakers"
    ),

    product(
        "Puma Training Shoes",
        "Flexible training shoes suitable for gym sessions, walking and general fitness.",
        "Shoes",
        799,
        "Blue",
        "8",
        "Totalsports",
        "Durban",
        50,
        4.4,
        "puma-training-shoes"
    ),

    product(
        "Classic Lifestyle Sneakers",
        "Minimal everyday sneakers designed for casual streetwear and comfortable daily use.",
        "Shoes",
        699,
        "Red",
        "10",
        "Superbalist",
        "Cape Town",
        40,
        4.3,
        "classic-sneakers"
    ),

    product(
        "Trail Running Shoes",
        "Durable trail shoes with rugged grip for outdoor running and hiking routes.",
        "Shoes",
        1299,
        "Grey",
        "9",
        "Totalsports",
        "Cape Town",
        60,
        4.7,
        "trail-running-shoes"
    ),

    product(
        "White Court Sneakers",
        "Clean low-top court sneakers designed for casual outfits and everyday wear.",
        "Shoes",
        899,
        "White",
        "8",
        "Superbalist",
        "Durban",
        45,
        4.6,
        "white-court-sneakers"
    ),

    product(
        "High Top Street Sneakers",
        "High-top sneakers with padded ankle support and urban streetwear styling.",
        "Shoes",
        1199,
        "Black",
        "10",
        "Sportscene",
        "Johannesburg",
        55,
        4.5,
        "high-top-sneakers"
    ),

    product(
        "Lightweight Walking Shoes",
        "Comfortable breathable shoes designed for walking and long days on your feet.",
        "Shoes",
        749,
        "Grey",
        "9",
        "Totalsports",
        "Durban",
        45,
        4.4,
        "walking-shoes"
    ),

    product(
        "Performance Basketball Shoes",
        "Supportive basketball shoes offering grip, cushioning and ankle stability.",
        "Shoes",
        1499,
        "Red",
        "11",
        "Sportscene",
        "Cape Town",
        65,
        4.8,
        "basketball-shoes"
    ),

    product(
        "Casual Slip On Shoes",
        "Lightweight slip-on shoes designed for easy everyday casual wear.",
        "Shoes",
        599,
        "Navy",
        "9",
        "Superbalist",
        "Johannesburg",
        40,
        4.3,
        "slip-on-shoes"
    ),


    # ========================================================
    # GAMING - 12
    # ========================================================

    product(
        "Wireless Gaming Mouse",
        "Wireless gaming mouse with adjustable DPI, ergonomic controls and responsive tracking.",
        "Gaming",
        199,
        "Black",
        "Standard",
        "Takealot",
        "Cape Town",
        35,
        4.4,
        "gaming-mouse"
    ),

    product(
        "Mechanical Gaming Keyboard",
        "Full-size RGB mechanical keyboard suitable for gaming, programming and daily computer use.",
        "Gaming",
        299,
        "Black",
        "Full Size",
        "Takealot",
        "Johannesburg",
        45,
        4.7,
        "gaming-keyboard"
    ),

    product(
        "RGB Gaming Headset",
        "Over-ear gaming headset with microphone, surround sound and padded ear cups.",
        "Gaming",
        349,
        "Red",
        "Standard",
        "Incredible Connection",
        "Durban",
        55,
        4.5,
        "gaming-headset"
    ),

    product(
        "Wireless Game Controller",
        "Rechargeable wireless controller for PC gaming with vibration and ergonomic controls.",
        "Gaming",
        299,
        "White",
        "Standard",
        "Game",
        "Johannesburg",
        50,
        4.3,
        "game-controller"
    ),

    product(
        "Gaming Mouse Pad XL",
        "Large extended desk mouse pad with smooth tracking surface and non-slip base.",
        "Gaming",
        149,
        "Black",
        "XL",
        "Takealot",
        "Durban",
        35,
        4.6,
        "gaming-mouse-pad"
    ),

    product(
        "RGB Gaming Chair",
        "Ergonomic gaming chair with adjustable armrests, lumbar support and reclining back.",
        "Gaming",
        1499,
        "Black",
        "Large",
        "Game",
        "Cape Town",
        250,
        4.7,
        "gaming-chair"
    ),

    product(
        "USB Gaming Microphone",
        "Desktop condenser microphone designed for gaming chat, streaming and voice recording.",
        "Gaming",
        599,
        "Black",
        "Desktop",
        "Takealot",
        "Johannesburg",
        50,
        4.5,
        "gaming-microphone"
    ),

    product(
        "1080p Streaming Webcam",
        "Full HD webcam designed for streaming, meetings and online gaming content.",
        "Gaming",
        449,
        "Black",
        "1080p",
        "Incredible Connection",
        "Durban",
        45,
        4.6,
        "streaming-webcam"
    ),

    product(
        "Gaming Laptop Cooling Pad",
        "USB-powered laptop cooling stand with multiple quiet fans and adjustable height.",
        "Gaming",
        399,
        "Black",
        "17 inch",
        "Takealot",
        "Cape Town",
        45,
        4.4,
        "laptop-cooling-pad"
    ),

    product(
        "RGB Desktop Speakers",
        "Compact stereo gaming speakers with RGB lighting and USB power.",
        "Gaming",
        399,
        "Black",
        "Desktop",
        "Game",
        "Durban",
        50,
        4.3,
        "gaming-speakers"
    ),

    product(
        "Gaming Desk",
        "Wide gaming desk with cable management, headphone hook and durable carbon-look surface.",
        "Gaming",
        1499,
        "Black",
        "120cm",
        "Game",
        "Johannesburg",
        200,
        4.6,
        "gaming-desk"
    ),

    product(
        "Portable Gaming Console",
        "Compact handheld gaming console with rechargeable battery and portable display.",
        "Gaming",
        1999,
        "Black",
        "Portable",
        "Incredible Connection",
        "Cape Town",
        75,
        4.5,
        "portable-console"
    ),


    # ========================================================
    # TECHNOLOGY - 18
    # ========================================================

    product(
        "15.6 Inch Student Laptop",
        "Everyday laptop suitable for university work, web browsing, coding and office applications.",
        "Technology",
        6999,
        "Silver",
        "15.6 inch",
        "Incredible Connection",
        "Durban",
        0,
        4.6,
        "student-laptop"
    ),

    product(
        "27 Inch Full HD Monitor",
        "Full HD desktop monitor suitable for coding, office work, studying and entertainment.",
        "Technology",
        2299,
        "Black",
        "27 inch",
        "Takealot",
        "Cape Town",
        80,
        4.7,
        "full-hd-monitor"
    ),

    product(
        "Portable Bluetooth Speaker",
        "Compact rechargeable wireless speaker for music at home, outdoors and while travelling.",
        "Technology",
        299,
        "Blue",
        "Portable",
        "Game",
        "Durban",
        50,
        4.5,
        "bluetooth-speaker"
    ),

    product(
        "Wireless Noise Cancelling Headphones",
        "Bluetooth over-ear headphones with active noise cancellation for music, studying and travel.",
        "Technology",
        999,
        "Black",
        "Standard",
        "Takealot",
        "Johannesburg",
        60,
        4.8,
        "noise-cancelling-headphones"
    ),

    product(
        "10 Inch Android Tablet",
        "Portable tablet for browsing, streaming, studying and lightweight productivity.",
        "Technology",
        1499,
        "Grey",
        "10 inch",
        "Game",
        "Durban",
        60,
        4.5,
        "android-tablet"
    ),

    product(
        "Smart Fitness Watch",
        "Smartwatch with fitness tracking, heart-rate monitoring and smartphone notifications.",
        "Technology",
        499,
        "Black",
        "Standard",
        "Takealot",
        "Cape Town",
        40,
        4.6,
        "smart-watch"
    ),

    product(
        "Wireless Earbuds",
        "Compact Bluetooth earbuds with charging case for music, calls and daily commuting.",
        "Technology",
        99,
        "White",
        "Standard",
        "Incredible Connection",
        "Johannesburg",
        45,
        4.5,
        "wireless-earbuds"
    ),

    product(
        "Portable Power Bank",
        "High-capacity portable battery for charging smartphones and USB devices on the go.",
        "Technology",
        149,
        "Black",
        "20000mAh",
        "Takealot",
        "Durban",
        35,
        4.7,
        "power-bank"
    ),

    product(
        "USB C Multiport Hub",
        "Compact USB-C hub with HDMI, USB and card-reader connectivity for laptops.",
        "Technology",
        399,
        "Grey",
        "7 in 1",
        "Incredible Connection",
        "Cape Town",
        40,
        4.6,
        "usb-c-hub"
    ),

    product(
        "Wireless Router",
        "Dual-band home Wi-Fi router suitable for streaming, studying and connected devices.",
        "Technology",
        499,
        "Black",
        "Dual Band",
        "Game",
        "Johannesburg",
        50,
        4.5,
        "wireless-router"
    ),

    product(
        "External SSD Drive",
        "Portable solid-state storage drive for backups, projects and high-speed file transfers.",
        "Technology",
        899,
        "Black",
        "1TB",
        "Takealot",
        "Durban",
        45,
        4.8,
        "external-ssd"
    ),

    product(
        "Full HD USB Webcam",
        "1080p webcam with built-in microphone for meetings, classes and video calls.",
        "Technology",
        299,
        "Black",
        "1080p",
        "Incredible Connection",
        "Cape Town",
        40,
        4.5,
        "usb-webcam"
    ),

    product(
        "Compact Wireless Keyboard",
        "Slim wireless keyboard designed for home, office and portable workstation setups.",
        "Technology",
        299,
        "White",
        "Compact",
        "Game",
        "Durban",
        35,
        4.4,
        "wireless-keyboard"
    ),

    product(
        "Ergonomic Wireless Mouse",
        "Comfortable wireless mouse designed for office work, studying and everyday computing.",
        "Technology",
        199,
        "Black",
        "Standard",
        "Takealot",
        "Johannesburg",
        35,
        4.4,
        "wireless-mouse"
    ),

    product(
        "Laptop Stand",
        "Adjustable aluminium laptop stand designed to improve posture and desk airflow.",
        "Technology",
        249,
        "Silver",
        "Adjustable",
        "Takealot",
        "Cape Town",
        40,
        4.7,
        "laptop-stand"
    ),

    product(
        "Mini Projector",
        "Portable projector for movies, presentations and casual home entertainment.",
        "Technology",
        1499,
        "White",
        "Portable",
        "Game",
        "Durban",
        70,
        4.3,
        "mini-projector"
    ),

    product(
        "Smart Home Security Camera",
        "Wi-Fi indoor security camera with motion detection and mobile app monitoring.",
        "Technology",
        899,
        "White",
        "Indoor",
        "Takealot",
        "Johannesburg",
        45,
        4.5,
        "security-camera"
    ),

    product(
        "Portable Photo Printer",
        "Compact wireless printer designed for printing smartphone photos on the go.",
        "Technology",
        799,
        "White",
        "Portable",
        "Incredible Connection",
        "Cape Town",
        55,
        4.6,
        "photo-printer"
    ),


    # ========================================================
    # MUSIC - 10
    # ========================================================

    product(
        "Acoustic Guitar",
        "Beginner-friendly full-size acoustic guitar suitable for lessons and home practice.",
        "Music",
        1099,
        "Natural",
        "Full Size",
        "Music World",
        "Durban",
        100,
        4.5,
        "acoustic-guitar"
    ),

    product(
        "Electric Guitar Starter Kit",
        "Electric guitar starter package for beginners including essential practice accessories.",
        "Music",
        1499,
        "Black",
        "Full Size",
        "Music World",
        "Johannesburg",
        120,
        4.7,
        "electric-guitar"
    ),

    product(
        "USB Studio Microphone",
        "USB condenser microphone for streaming, podcasting, voice recording and music production.",
        "Music",
        99,
        "Black",
        "Desktop",
        "Sound Select",
        "Cape Town",
        60,
        4.6,
        "studio-microphone"
    ),

    product(
        "Digital Piano Keyboard",
        "Portable digital keyboard suitable for beginners, music practice and home performances.",
        "Music",
        799,
        "Black",
        "61 Key",
        "Sound Select",
        "Durban",
        100,
        4.5,
        "digital-keyboard"
    ),

    product(
        "Studio Monitor Headphones",
        "Closed-back headphones designed for recording, mixing and detailed music listening.",
        "Music",
        299,
        "Black",
        "Standard",
        "Sound Select",
        "Johannesburg",
        55,
        4.7,
        "studio-headphones"
    ),

    product(
        "Portable MIDI Keyboard",
        "Compact USB MIDI controller for beat making, music production and software instruments.",
        "Music",
        599,
        "Black",
        "25 Key",
        "Music World",
        "Cape Town",
        60,
        4.6,
        "midi-keyboard"
    ),

    product(
        "Guitar Practice Amplifier",
        "Compact electric guitar amplifier suitable for home practice and beginners.",
        "Music",
        699,
        "Black",
        "20W",
        "Music World",
        "Durban",
        75,
        4.5,
        "guitar-amplifier"
    ),

    product(
        "Electronic Drum Pad",
        "Portable electronic drum pad for rhythm practice, recording and beginner drumming.",
        "Music",
        1000,
        "Black",
        "Portable",
        "Sound Select",
        "Johannesburg",
        80,
        4.4,
        "electronic-drum-pad"
    ),

    product(
        "Ukulele",
        "Compact beginner-friendly ukulele designed for casual playing and music lessons.",
        "Music",
        199,
        "Natural",
        "Concert",
        "Music World",
        "Cape Town",
        45,
        4.6,
        "ukulele"
    ),

    product(
        "Microphone Boom Arm",
        "Adjustable desk-mounted microphone arm for podcasting, streaming and studio setups.",
        "Music",
        299,
        "Black",
        "Adjustable",
        "Sound Select",
        "Durban",
        45,
        4.5,
        "microphone-boom-arm"
    ),


    # ========================================================
    # BAGS - 8
    # ========================================================

    product(
        "Laptop Backpack",
        "Water-resistant backpack with padded laptop compartment for students and commuters.",
        "Bags",
        299,
        "Black",
        "15.6 inch",
        "Superbalist",
        "Johannesburg",
        40,
        4.3,
        "laptop-backpack"
    ),

    product(
        "Canvas Student Backpack",
        "Casual backpack with multiple compartments for books, accessories and daily essentials.",
        "Bags",
        349,
        "Green",
        "Medium",
        "Superbalist",
        "Durban",
        40,
        4.4,
        "student-backpack"
    ),

    product(
        "Professional Laptop Messenger Bag",
        "Professional shoulder bag with padded laptop storage for meetings and commuting.",
        "Bags",
        499,
        "Brown",
        "15.6 inch",
        "Woolworths",
        "Cape Town",
        55,
        4.6,
        "messenger-bag"
    ),

    product(
        "Travel Duffel Bag",
        "Spacious travel bag for gym sessions, weekend trips and everyday travel.",
        "Bags",
        399,
        "Blue",
        "Large",
        "Totalsports",
        "Durban",
        60,
        4.5,
        "duffel-bag"
    ),

    product(
        "Compact Crossbody Bag",
        "Small everyday crossbody bag designed for phones, wallets and essentials.",
        "Bags",
        249,
        "Black",
        "Small",
        "Superbalist",
        "Johannesburg",
        35,
        4.4,
        "crossbody-bag"
    ),

    product(
        "Travel Laptop Backpack",
        "Large travel backpack with padded technology storage and organiser compartments.",
        "Bags",
        599,
        "Grey",
        "Large",
        "Woolworths",
        "Cape Town",
        60,
        4.7,
        "travel-laptop-backpack"
    ),

    product(
        "Gym Training Bag",
        "Sports bag with separate shoe compartment and spacious workout storage.",
        "Bags",
        299,
        "Black",
        "Medium",
        "Totalsports",
        "Durban",
        45,
        4.5,
        "gym-bag"
    ),

    product(
        "Minimalist Tote Bag",
        "Simple structured tote bag suitable for work, shopping and everyday essentials.",
        "Bags",
        199,
        "Beige",
        "Medium",
        "Woolworths",
        "Johannesburg",
        40,
        4.4,
        "tote-bag"
    ),


    # ========================================================
    # CLOTHING - 12
    # ========================================================

    product(
        "Classic Cotton Hoodie",
        "Comfortable everyday hoodie suitable for casual wear and cooler weather.",
        "Clothing",
        399,
        "Black",
        "Large",
        "Cotton On",
        "Durban",
        45,
        4.5,
        "cotton-hoodie"
    ),

    product(
        "Relaxed Fit T-Shirt",
        "Soft cotton relaxed-fit T-shirt designed for comfortable everyday casual wear.",
        "Clothing",
        149,
        "White",
        "Medium",
        "Cotton On",
        "Johannesburg",
        40,
        4.4,
        "relaxed-tshirt"
    ),

    product(
        "Slim Fit Denim Jeans",
        "Classic slim-fit denim jeans suitable for casual and smart-casual outfits.",
        "Clothing",
        399,
        "Blue",
        "32",
        "Woolworths",
        "Durban",
        50,
        4.6,
        "denim-jeans"
    ),

    product(
        "Lightweight Training Jacket",
        "Lightweight sports jacket suitable for running, training and outdoor wear.",
        "Clothing",
        399,
        "Red",
        "Large",
        "Totalsports",
        "Cape Town",
        60,
        4.7,
        "training-jacket"
    ),

    product(
        "Classic Polo Shirt",
        "Clean casual polo shirt suitable for work, weekends and smart-casual outfits.",
        "Clothing",
        249,
        "Navy",
        "Medium",
        "Woolworths",
        "Johannesburg",
        45,
        4.5,
        "polo-shirt"
    ),

    product(
        "Jogger Sweatpants",
        "Soft tapered jogger pants suitable for casual wear, travel and relaxed training.",
        "Clothing",
        249,
        "Grey",
        "Large",
        "Cotton On",
        "Durban",
        45,
        4.4,
        "jogger-pants"
    ),

    product(
        "Oversized Graphic T-Shirt",
        "Relaxed oversized T-shirt designed for modern streetwear and casual outfits.",
        "Clothing",
        249,
        "Black",
        "Large",
        "Superbalist",
        "Cape Town",
        40,
        4.3,
        "graphic-tshirt"
    ),

    product(
        "Quilted Winter Jacket",
        "Warm lightweight quilted jacket designed for colder weather and everyday wear.",
        "Clothing",
        650,
        "Black",
        "Large",
        "Woolworths",
        "Johannesburg",
        60,
        4.7,
        "winter-jacket"
    ),

    product(
        "Training Shorts",
        "Breathable athletic shorts designed for running, gym workouts and active wear.",
        "Clothing",
        99,
        "Black",
        "Medium",
        "Totalsports",
        "Durban",
        40,
        4.5,
        "training-shorts"
    ),

    product(
        "Casual Chino Pants",
        "Versatile slim-cut chino pants for office, smart-casual and weekend wear.",
        "Clothing",
        199,
        "Khaki",
        "32",
        "Woolworths",
        "Cape Town",
        50,
        4.6,
        "chino-pants"
    ),

    product(
        "Zip Up Hoodie",
        "Soft zip-front hoodie designed for layering, travel and casual everyday use.",
        "Clothing",
        249,
        "Grey",
        "Medium",
        "Cotton On",
        "Johannesburg",
        45,
        4.5,
        "zip-hoodie"
    ),

    product(
        "Long Sleeve Casual Shirt",
        "Lightweight long-sleeve shirt suited to casual and smart-casual outfits.",
        "Clothing",
        199,
        "Blue",
        "Large",
        "Woolworths",
        "Durban",
        45,
        4.6,
        "casual-shirt"
    ),


    # ========================================================
    # HOME & LIFESTYLE - 10
    # ========================================================

    product(
        "LED Desk Lamp",
        "Adjustable LED desk lamp designed for studying, reading and home office work.",
        "Home & Lifestyle",
        299,
        "Black",
        "Desktop",
        "Mr Price Home",
        "Durban",
        45,
        4.6,
        "desk-lamp"
    ),

    product(
        "Ergonomic Office Chair",
        "Supportive adjustable office chair designed for studying and long work sessions.",
        "Home & Lifestyle",
        999,
        "Black",
        "Standard",
        "Game",
        "Johannesburg",
        180,
        4.7,
        "office-chair"
    ),

    product(
        "Insulated Travel Mug",
        "Reusable insulated travel mug designed to keep drinks hot or cold while commuting.",
        "Home & Lifestyle",
        49,
        "Black",
        "500ml",
        "Woolworths",
        "Cape Town",
        35,
        4.5,
        "travel-mug"
    ),

    product(
        "Digital Alarm Clock",
        "Minimal bedside alarm clock with LED display and USB charging functionality.",
        "Home & Lifestyle",
        99,
        "White",
        "Standard",
        "Mr Price Home",
        "Durban",
        40,
        4.4,
        "alarm-clock"
    ),

    product(
        "Aroma Diffuser",
        "Compact essential-oil diffuser with soft ambient lighting for home relaxation.",
        "Home & Lifestyle",
        109,
        "White",
        "300ml",
        "Mr Price Home",
        "Johannesburg",
        40,
        4.6,
        "aroma-diffuser"
    ),

    product(
        "Portable Blender",
        "Rechargeable personal blender designed for smoothies and drinks while travelling.",
        "Home & Lifestyle",
        299,
        "Blue",
        "Portable",
        "Game",
        "Cape Town",
        45,
        4.5,
        "portable-blender"
    ),

    product(
        "Stainless Steel Water Bottle",
        "Reusable insulated bottle for gym, study, work and outdoor activities.",
        "Home & Lifestyle",
        99,
        "Silver",
        "750ml",
        "Woolworths",
        "Durban",
        35,
        4.7,
        "water-bottle"
    ),

    product(
        "Memory Foam Pillow",
        "Supportive memory foam pillow designed for comfortable sleeping and neck support.",
        "Home & Lifestyle",
        199,
        "White",
        "Standard",
        "Mr Price Home",
        "Johannesburg",
        55,
        4.6,
        "memory-foam-pillow"
    ),

    product(
        "Electric Kettle",
        "Fast-boil electric kettle suitable for kitchens, student accommodation and offices.",
        "Home & Lifestyle",
        249,
        "Black",
        "1.7L",
        "Game",
        "Cape Town",
        55,
        4.5,
        "electric-kettle"
    ),

    product(
        "Desktop Organiser",
        "Minimal desk organiser for stationery, cables and small office accessories.",
        "Home & Lifestyle",
        99,
        "Natural",
        "Desktop",
        "Mr Price Home",
        "Durban",
        35,
        4.4,
        "desk-organiser"
    ),
    # ========================================================
    # GROCERIES - 50
    # ========================================================

    product(
        'White Bread',
        'Soft sliced white bread for affordable breakfasts, sandwiches and quick student meals.',
        'Groceries',
        19.99,
        'White',
        '700g',
        'Shoprite',
        'Durban',
        20,
        4.5,
        'white-bread'
    ),

    product(
        'Brown Bread',
        'High-fibre sliced brown bread for breakfasts, sandwiches and everyday meals.',
        'Groceries',
        17.99,
        'Brown',
        '700g',
        'Checkers',
        'Johannesburg',
        20,
        4.5,
        'brown-bread'
    ),

    product(
        'Full Cream Milk',
        'Long-life full cream milk for cereal, tea, coffee and everyday cooking.',
        'Groceries',
        21.99,
        'White',
        '1L',
        'SPAR',
        'Cape Town',
        20,
        4.6,
        'full-cream-milk'
    ),

    product(
        'Low Fat Milk',
        'Long-life low-fat milk for cereal, drinks and everyday student meals.',
        'Groceries',
        22.99,
        'White',
        '1L',
        'Woolworths',
        'Durban',
        20,
        4.5,
        'low-fat-milk'
    ),

    product(
        'Large Eggs',
        'Tray of fresh eggs suitable for breakfast, baking and quick protein-rich meals.',
        'Groceries',
        49.99,
        'Brown',
        '18 Pack',
        'Shoprite',
        'Johannesburg',
        25,
        4.7,
        'large-eggs'
    ),

    product(
        'Long Grain Rice',
        'Versatile long-grain rice for curries, stews, meal prep and everyday dinners.',
        'Groceries',
        32.99,
        'White',
        '2kg',
        'Checkers',
        'Cape Town',
        25,
        4.7,
        'long-grain-rice'
    ),

    product(
        'Maize Meal',
        'South African maize meal for pap and affordable everyday staple meals.',
        'Groceries',
        29.99,
        'White',
        '2.5kg',
        'Shoprite',
        'Durban',
        25,
        4.6,
        'maize-meal'
    ),

    product(
        'Samp',
        'Traditional dried maize kernels suitable for hearty student-friendly meals.',
        'Groceries',
        24.99,
        'White',
        '1kg',
        'SPAR',
        'Johannesburg',
        25,
        4.4,
        'samp'
    ),

    product(
        'Macaroni Pasta',
        'Dry macaroni pasta for quick lunches, pasta bakes and budget dinners.',
        'Groceries',
        14.99,
        'Yellow',
        '500g',
        'Checkers',
        'Cape Town',
        20,
        4.5,
        'macaroni'
    ),

    product(
        'Spaghetti Pasta',
        'Dry spaghetti for simple tomato, mince and vegetable pasta meals.',
        'Groceries',
        16.99,
        'Yellow',
        '500g',
        'Woolworths',
        'Durban',
        20,
        4.5,
        'spaghetti'
    ),

    product(
        'Instant Noodles',
        'Quick-cooking instant noodles for convenient student lunches and late-night meals.',
        'Groceries',
        9.99,
        'Yellow',
        'Single Pack',
        'Shoprite',
        'Johannesburg',
        15,
        4.3,
        'instant-noodles'
    ),

    product(
        'Cake Wheat Flour',
        'General-purpose wheat flour for baking, sauces and everyday cooking.',
        'Groceries',
        24.99,
        'White',
        '2.5kg',
        'Checkers',
        'Cape Town',
        25,
        4.6,
        'cake-flour'
    ),

    product(
        'White Sugar',
        'Granulated white sugar for tea, coffee, baking and cooking.',
        'Groceries',
        29.99,
        'White',
        '2.5kg',
        'SPAR',
        'Durban',
        25,
        4.5,
        'white-sugar'
    ),

    product(
        'Brown Sugar',
        'Soft brown sugar suitable for baking, hot drinks and desserts.',
        'Groceries',
        25.99,
        'Brown',
        '1kg',
        'Woolworths',
        'Johannesburg',
        20,
        4.5,
        'brown-sugar'
    ),

    product(
        'Sunflower Cooking Oil',
        'Everyday sunflower oil for frying, roasting and general cooking.',
        'Groceries',
        39.99,
        'Yellow',
        '2L',
        'Shoprite',
        'Cape Town',
        30,
        4.6,
        'cooking-oil'
    ),

    product(
        'Margarine Spread',
        'Everyday margarine spread for bread, cooking and baking.',
        'Groceries',
        24.99,
        'Yellow',
        '500g',
        'Checkers',
        'Durban',
        20,
        4.4,
        'margarine'
    ),

    product(
        'Table Salt',
        'Fine table salt for seasoning and everyday meal preparation.',
        'Groceries',
        10.99,
        'White',
        '500g',
        'SPAR',
        'Johannesburg',
        15,
        4.5,
        'table-salt'
    ),

    product(
        'Baked Beans',
        'Ready-to-heat baked beans in tomato sauce for quick affordable meals.',
        'Groceries',
        11.99,
        'Orange',
        '410g',
        'Shoprite',
        'Cape Town',
        15,
        4.6,
        'baked-beans'
    ),

    product(
        'Chopped Tomatoes',
        'Canned chopped tomatoes for pasta sauces, stews and curries.',
        'Groceries',
        13.99,
        'Red',
        '410g',
        'Checkers',
        'Durban',
        15,
        4.5,
        'chopped-tomatoes'
    ),

    product(
        'Tomato Sauce',
        'Classic tomato sauce for chips, burgers, sandwiches and cooked meals.',
        'Groceries',
        20.99,
        'Red',
        '750ml',
        'SPAR',
        'Johannesburg',
        20,
        4.4,
        'tomato-sauce'
    ),

    product(
        'Mayonnaise',
        'Creamy mayonnaise for sandwiches, salads and quick student meals.',
        'Groceries',
        29.99,
        'White',
        '750g',
        'Woolworths',
        'Cape Town',
        20,
        4.6,
        'mayonnaise'
    ),

    product(
        'Peanut Butter',
        'Smooth peanut butter for toast, sandwiches, oats and snacks.',
        'Groceries',
        24.99,
        'Brown',
        '400g',
        'Shoprite',
        'Durban',
        20,
        4.7,
        'peanut-butter'
    ),

    product(
        'Mixed Fruit Jam',
        'Sweet mixed-fruit jam for toast, sandwiches and breakfast.',
        'Groceries',
        21.99,
        'Red',
        '450g',
        'Checkers',
        'Johannesburg',
        20,
        4.4,
        'fruit-jam'
    ),

    product(
        'Rooibos Tea',
        'Caffeine-free rooibos tea bags for affordable everyday hot drinks.',
        'Groceries',
        19.99,
        'Red',
        '80 Pack',
        'SPAR',
        'Cape Town',
        20,
        4.7,
        'rooibos-tea'
    ),

    product(
        'Instant Coffee',
        'Instant coffee granules for quick hot drinks while studying or working.',
        'Groceries',
        39.99,
        'Brown',
        '200g',
        'Shoprite',
        'Durban',
        20,
        4.6,
        'instant-coffee'
    ),

    product(
        'Corn Flakes',
        'Crispy corn breakfast cereal for quick breakfasts with milk.',
        'Groceries',
        39.99,
        'Yellow',
        '500g',
        'Checkers',
        'Johannesburg',
        20,
        4.5,
        'corn-flakes'
    ),

    product(
        'Rolled Oats',
        'Wholegrain rolled oats for porridge, overnight oats and baking.',
        'Groceries',
        29.99,
        'Beige',
        '1kg',
        'Woolworths',
        'Cape Town',
        20,
        4.7,
        'rolled-oats'
    ),

    product(
        'Wheat Biscuits',
        'Wholegrain wheat breakfast biscuits for a filling student breakfast.',
        'Groceries',
        29.99,
        'Brown',
        '450g',
        'SPAR',
        'Durban',
        20,
        4.6,
        'wheat-biscuits'
    ),

    product(
        'Cream Biscuits',
        'Sweet cream-filled biscuits for snacks, tea breaks and lunchboxes.',
        'Groceries',
        12.99,
        'Brown',
        '200g',
        'Shoprite',
        'Johannesburg',
        15,
        4.4,
        'cream-biscuits'
    ),

    product(
        'Potato Chips',
        'Salted potato chips for casual snacking and sharing.',
        'Groceries',
        14.99,
        'Yellow',
        '120g',
        'Checkers',
        'Cape Town',
        15,
        4.4,
        'potato-chips'
    ),

    product(
        'Tinned Tuna',
        'Canned tuna for sandwiches, salads, pasta and protein-rich meals.',
        'Groceries',
        19.99,
        'Silver',
        '170g',
        'Woolworths',
        'Durban',
        15,
        4.7,
        'tinned-tuna'
    ),

    product(
        'Tinned Corn',
        'Sweet corn kernels for salads, rice dishes and quick meals.',
        'Groceries',
        11.99,
        'Yellow',
        '410g',
        'Shoprite',
        'Johannesburg',
        15,
        4.5,
        'tinned-corn'
    ),

    product(
        'Tinned Peas',
        'Canned green peas for stews, rice dishes and convenient side portions.',
        'Groceries',
        11.99,
        'Green',
        '410g',
        'SPAR',
        'Cape Town',
        15,
        4.4,
        'tinned-peas'
    ),

    product(
        'Plain Yoghurt',
        'Smooth plain yoghurt for breakfast, smoothies and snacks.',
        'Groceries',
        23.99,
        'White',
        '1kg',
        'Woolworths',
        'Durban',
        25,
        4.7,
        'plain-yoghurt'
    ),

    product(
        'Cheddar Cheese',
        'Everyday cheddar cheese for sandwiches, pasta, toast and cooking.',
        'Groceries',
        39.99,
        'Yellow',
        '500g',
        'Checkers',
        'Johannesburg',
        25,
        4.7,
        'cheddar-cheese'
    ),

    product(
        'Butter',
        'Creamy butter for bread, baking and everyday cooking.',
        'Groceries',
        24.99,
        'Yellow',
        '500g',
        'SPAR',
        'Cape Town',
        25,
        4.6,
        'butter'
    ),

    product(
        'Fresh Chicken Portions',
        'Fresh chicken portions suitable for roasting, curries and student meal prep.',
        'Groceries',
        49.99,
        'Pink',
        '1kg',
        'Shoprite',
        'Durban',
        30,
        4.6,
        'fresh-chicken'
    ),

    product(
        'Beef Mince',
        'Fresh beef mince for pasta, burgers, curries and meal preparation.',
        'Groceries',
        49.99,
        'Red',
        '500g',
        'Checkers',
        'Johannesburg',
        30,
        4.7,
        'beef-mince'
    ),

    product(
        'Boerewors',
        'South African-style beef sausage for braais, pan frying and hearty meals.',
        'Groceries',
        59.99,
        'Red',
        '600g',
        'SPAR',
        'Cape Town',
        30,
        4.6,
        'boerewors'
    ),

    product(
        'Frozen Mixed Vegetables',
        'Convenient frozen vegetable mix for stir-fries, stews and side dishes.',
        'Groceries',
        29.99,
        'Multicolour',
        '1kg',
        'Woolworths',
        'Durban',
        25,
        4.6,
        'frozen-vegetables'
    ),

    product(
        'Frozen Chips',
        'Ready-to-cook frozen potato chips for quick oven or air-fryer meals.',
        'Groceries',
        29.99,
        'Yellow',
        '1kg',
        'Checkers',
        'Johannesburg',
        25,
        4.5,
        'frozen-chips'
    ),

    product(
        'Potatoes',
        'Fresh potatoes for boiling, roasting, mashing and budget-friendly meals.',
        'Groceries',
        19.99,
        'Brown',
        '2kg',
        'Shoprite',
        'Cape Town',
        25,
        4.7,
        'potatoes'
    ),

    product(
        'Carrots',
        'Fresh carrots for salads, stews, curries and everyday cooking.',
        'Groceries',
        10.99,
        'Orange',
        '1kg',
        'SPAR',
        'Durban',
        20,
        4.6,
        'carrots'
    ),

    product(
        'Onions',
        'Fresh onions for flavouring curries, stews, sauces and cooked meals.',
        'Groceries',
        20.99,
        'Brown',
        '1kg',
        'Checkers',
        'Johannesburg',
        20,
        4.7,
        'onions'
    ),

    product(
        'Tomatoes',
        'Fresh tomatoes for salads, sandwiches, sauces and cooked meals.',
        'Groceries',
        21.99,
        'Red',
        '1kg',
        'Woolworths',
        'Cape Town',
        20,
        4.6,
        'tomatoes'
    ),

    product(
        'Bananas',
        'Fresh bananas for breakfast, smoothies and convenient student snacks.',
        'Groceries',
        14.99,
        'Yellow',
        '1kg',
        'Shoprite',
        'Durban',
        20,
        4.7,
        'bananas'
    ),

    product(
        'Apples',
        'Fresh apples for lunchboxes, snacks and everyday fruit portions.',
        'Groceries',
        14.99,
        'Red',
        '1kg',
        'Checkers',
        'Johannesburg',
        20,
        4.7,
        'apples'
    ),

    product(
        'Oranges',
        'Fresh oranges for snacks, breakfast and vitamin-rich fruit portions.',
        'Groceries',
        14.99,
        'Orange',
        '1kg',
        'SPAR',
        'Cape Town',
        20,
        4.6,
        'oranges'
    ),

    product(
        'Spinach',
        'Fresh leafy spinach for stews, sautés and nutritious student meals.',
        'Groceries',
        11.99,
        'Green',
        'Bunch',
        'Woolworths',
        'Durban',
        20,
        4.5,
        'spinach'
    ),

    product(
        'Avocados',
        'Fresh avocados for toast, salads, sandwiches and simple meals.',
        'Groceries',
        19.99,
        'Green',
        '2 Pack',
        'Checkers',
        'Johannesburg',
        20,
        4.6,
        'avocados'
    ),


    # ========================================================
    # TOILETRIES - 10
    # ========================================================

    product(
        'Face Wash',
        'Gentle daily face wash for cleansing skin and removing excess oil.',
        'Toiletries',
        39.99,
        'White',
        '150ml',
        'Checkers',
        'Durban',
        20,
        4.5,
        'face-wash'
    ),

    product(
        'Face Moisturiser',
        'Everyday facial moisturiser for keeping skin hydrated after cleansing.',
        'Toiletries',
        49.99,
        'White',
        '100ml',
        'Woolworths',
        'Johannesburg',
        20,
        4.6,
        'face-moisturiser'
    ),

    product(
        'Sunscreen SPF 50',
        'High-protection sunscreen for everyday face and body sun protection.',
        'Toiletries',
        119.99,
        'Yellow',
        '200ml',
        'SPAR',
        'Cape Town',
        20,
        4.7,
        'sunscreen'
    ),

    product(
        'Hand Wash',
        'Liquid hand wash for everyday hygiene in student accommodation and shared bathrooms.',
        'Toiletries',
        39.99,
        'Green',
        '500ml',
        'Shoprite',
        'Durban',
        20,
        4.6,
        'hand-wash'
    ),

    product(
        'Hand Sanitiser',
        'Portable alcohol-based hand sanitiser for convenient everyday hygiene.',
        'Toiletries',
        34.99,
        'Clear',
        '250ml',
        'Checkers',
        'Johannesburg',
        15,
        4.5,
        'hand-sanitiser'
    ),

    product(
        'Facial Tissues',
        'Soft disposable facial tissues for everyday personal care and hygiene.',
        'Toiletries',
        20.99,
        'White',
        '100 Pack',
        'SPAR',
        'Cape Town',
        15,
        4.5,
        'facial-tissues'
    ),

    product(
        'Cotton Buds',
        'Multipurpose cotton buds for personal care and grooming.',
        'Toiletries',
        14.99,
        'White',
        '100 Pack',
        'Shoprite',
        'Durban',
        15,
        4.4,
        'cotton-buds'
    ),

    product(
        'Shaving Cream',
        'Smooth shaving cream designed for comfortable everyday grooming.',
        'Toiletries',
        54.99,
        'White',
        '200ml',
        'Checkers',
        'Johannesburg',
        20,
        4.5,
        'shaving-cream'
    ),

    product(
        'Disposable Razors',
        'Multipack disposable razors for convenient personal grooming.',
        'Toiletries',
        39.99,
        'Blue',
        '3 Pack',
        'Woolworths',
        'Cape Town',
        20,
        4.6,
        'disposable-razors'
    ),

    product(
        'Hair Conditioner',
        'Moisturising hair conditioner for regular washing and hair care.',
        'Toiletries',
        24.99,
        'White',
        '400ml',
        'SPAR',
        'Durban',
        20,
        4.6,
        'hair-conditioner'
    ),


]


# ============================================================
# SEED
# ============================================================

def seed_products():

    Base.metadata.create_all(
        bind=engine
    )


    db = SessionLocal()


    try:

        added = 0
        updated = 0


        for product_data in PRODUCTS:

            existing_product = (
                db.query(Product)
                .filter(
                    Product.name
                    == product_data[
                        "name"
                    ]
                )
                .first()
            )


            if existing_product:

                for field, value in (
                    product_data.items()
                ):

                    setattr(
                        existing_product,
                        field,
                        value
                    )


                updated += 1

                continue


            db.add(
                Product(
                    **product_data
                )
            )

            added += 1


        db.commit()


        total_products = (
            db.query(Product)
            .count()
        )


        print(
            "SmartShop AI catalogue seed complete."
        )

        print(
            f"Added: {added}"
        )

        print(
            f"Updated: {updated}"
        )

        print(
            f"Total products: {total_products}"
        )


    except Exception:

        db.rollback()

        raise


    finally:

        db.close()


if __name__ == "__main__":

    seed_products()