/**
 * NOTTEE9 Database Seeder
 * Run: node seed.js
 * Seeds the database with menu items and a default admin account.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Menu     = require('./models/Menu');
const Admin    = require('./models/Admin');

const MENU_ITEMS = [
  // ── STARTERS ────────────────────────────────────────────────
  { name:'Paneer Tikka', description:'Marinated cottage cheese grilled in tandoor with mint chutney', price:260, category:'Starter', type:'veg', spiceLevel:'medium', cuisine:'Indian', isSpecial:true, tags:['bestseller','tandoor'], image:'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&q=80' },
  { name:'Tandoori Chicken', description:'Slow-marinated chicken charred to perfection in clay oven', price:320, category:'Starter', type:'non-veg', spiceLevel:'spicy', cuisine:'Indian', isSpecial:true, tags:['bestseller','tandoor'], image:'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80' },
  { name:'Veg Spring Rolls', description:'Crispy rolls stuffed with seasoned vegetables & noodles', price:170, category:'Starter', type:'veg', spiceLevel:'mild', cuisine:'Chinese', isSpecial:false, tags:['crispy'], image:'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80' },
  { name:'Chilli Chicken (Dry)', description:'Crispy chicken tossed in fiery Indo-Chinese sauce', price:260, category:'Starter', type:'non-veg', spiceLevel:'spicy', cuisine:'Chinese', isSpecial:true, tags:['fan-favourite','spicy'], image:'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' },
  { name:'Baby Corn Chilli', description:'Tender baby corn in vibrant Indo-Asian sauce', price:210, category:'Starter', type:'veg', spiceLevel:'medium', cuisine:'Asian', isSpecial:false, tags:['veg-special'], image:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },
  { name:'Mushroom Chilli', description:'Juicy mushrooms glazed in bold chilli sauce', price:230, category:'Starter', type:'veg', spiceLevel:'spicy', cuisine:'Healthy', isSpecial:false, tags:['healthy','veg'], image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' },
  { name:'Chicken Lollipop', description:'Marinated chicken wings fried golden, with dipping sauce', price:290, category:'Starter', type:'non-veg', spiceLevel:'spicy', cuisine:'Chinese', isSpecial:false, tags:['popular'], image:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
  { name:'Steamed Dimsums (Veg)', description:'Handmade delicate dumplings with seasoned vegetables', price:180, category:'Starter', type:'veg', spiceLevel:'mild', cuisine:'Asian', isSpecial:false, tags:['light'], image:'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80' },
  { name:'Steamed Dimsums (Chicken)', description:'Handmade dumplings filled with seasoned chicken', price:210, category:'Starter', type:'non-veg', spiceLevel:'mild', cuisine:'Asian', isSpecial:false, image:'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80' },

  // ── MAIN COURSE ──────────────────────────────────────────────
  { name:'Butter Chicken', description:'Succulent chicken in rich velvety tomato-cream sauce', price:310, category:'Main Course', type:'non-veg', spiceLevel:'medium', cuisine:'Indian', isSpecial:true, tags:['bestseller','creamy'], image:'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
  { name:'Palak Paneer', description:'Soft cottage cheese cubes in smooth spiced spinach gravy', price:270, category:'Main Course', type:'veg', spiceLevel:'mild', cuisine:'Indian', isSpecial:false, tags:['healthy','veg'], image:'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&q=80' },
  { name:'Dal Makhani', description:'Slow-cooked black lentils in buttery tomato sauce overnight', price:240, category:'Main Course', type:'veg', spiceLevel:'mild', cuisine:'Indian', isSpecial:false, tags:['comfort-food'], image:'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&q=80' },
  { name:'Mutton Rogan Josh', description:'Aromatic Kashmiri mutton curry with whole spices', price:380, category:'Main Course', type:'non-veg', spiceLevel:'spicy', cuisine:'Indian', isSpecial:false, tags:['premium'], image:'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&q=80' },
  { name:'Thai Green Curry', description:'Aromatic Thai basil curry with coconut milk & vegetables', price:270, category:'Main Course', type:'veg', spiceLevel:'medium', cuisine:'Asian', isSpecial:false, tags:['thai'], image:'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&q=80' },
  { name:'Chilli Chicken Gravy', description:'Chicken in thick spicy Indo-Chinese gravy with capsicum', price:275, category:'Main Course', type:'non-veg', spiceLevel:'spicy', cuisine:'Chinese', isSpecial:false, tags:['chinese','spicy'], image:'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' },

  // ── RICE & BIRYANI ───────────────────────────────────────────
  { name:'Royal Chicken Biryani', description:'Fragrant basmati rice layered with tender chicken & saffron', price:280, category:'Rice & Biryani', type:'non-veg', spiceLevel:'medium', cuisine:'Indian', isSpecial:true, tags:['bestseller','must-try'], image:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
  { name:'Mutton Biryani', description:'Slow-dum cooked mutton biryani with caramelised onions', price:340, category:'Rice & Biryani', type:'non-veg', spiceLevel:'spicy', cuisine:'Indian', isSpecial:false, tags:['premium'], image:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
  { name:'Veg Biryani', description:'Aromatic basmati with seasonal vegetables & whole spices', price:220, category:'Rice & Biryani', type:'veg', spiceLevel:'mild', cuisine:'Indian', isSpecial:false, tags:['veg'], image:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
  { name:'Egg Fried Rice', description:'Wok-tossed rice with scrambled eggs & vegetables', price:200, category:'Rice & Biryani', type:'non-veg', spiceLevel:'mild', cuisine:'Chinese', isSpecial:false, image:'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&q=80' },
  { name:'Dragon Fried Rice', description:'Fiery wok-tossed rice with vegetables & dragon sauce', price:220, category:'Rice & Biryani', type:'veg', spiceLevel:'spicy', cuisine:'Chinese', isSpecial:false, tags:['spicy','chinese'], image:'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&q=80' },

  // ── NOODLES ──────────────────────────────────────────────────
  { name:'Veg Hakka Noodles', description:'Tossed thin noodles in soy, chilli & sesame', price:190, category:'Noodles & Fried Rice', type:'veg', spiceLevel:'mild', cuisine:'Chinese', isSpecial:false, image:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80' },
  { name:'Chicken Hakka Noodles', description:'Wok-tossed noodles with chicken, vegetables & sauces', price:230, category:'Noodles & Fried Rice', type:'non-veg', spiceLevel:'mild', cuisine:'Chinese', isSpecial:false, image:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80' },
  { name:'Schezwan Noodles', description:'Super spicy Schezwan sauce noodles with vegetables', price:210, category:'Noodles & Fried Rice', type:'veg', spiceLevel:'extra-spicy', cuisine:'Chinese', isSpecial:false, tags:['spicy'], image:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80' },

  // ── HEALTHY ──────────────────────────────────────────────────
  { name:'Garden Quinoa Bowl', description:'Nutrient-rich quinoa with roasted veg & lemon tahini', price:250, category:'Main Course', type:'veg', spiceLevel:'mild', cuisine:'Healthy', isSpecial:false, tags:['healthy','gluten-free'], image:'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80' },
  { name:'Grilled Chicken Salad', description:'Grilled chicken with fresh greens, croutons & dressing', price:270, category:'Starter', type:'non-veg', spiceLevel:'mild', cuisine:'Healthy', isSpecial:false, tags:['healthy','light'], image:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },

  // ── BREADS ───────────────────────────────────────────────────
  { name:'Butter Naan', description:'Soft leavened bread baked fresh in tandoor with butter', price:50, category:'Breads', type:'veg', spiceLevel:'mild', cuisine:'Indian', isSpecial:false, image:'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&q=80' },
  { name:'Garlic Naan', description:'Tandoor-baked naan topped with garlic & coriander butter', price:70, category:'Breads', type:'veg', spiceLevel:'mild', cuisine:'Indian', isSpecial:false, image:'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&q=80' },

  // ── MOCKTAILS ────────────────────────────────────────────────
  { name:'Virgin Mojito', description:'Fresh lime, mint & crushed ice — utterly refreshing', price:120, category:'Mocktails', type:'veg', spiceLevel:'mild', cuisine:'Continental', isSpecial:false, image:'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80' },
  { name:'Mango Lassi', description:'Thick mango blended with chilled yoghurt & cardamom', price:100, category:'Mocktails', type:'veg', spiceLevel:'mild', cuisine:'Indian', isSpecial:false, image:'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&q=80' },
  { name:'Blue Lagoon', description:'Stunning blue mocktail — divine to look at & drink', price:140, category:'Mocktails', type:'veg', spiceLevel:'mild', cuisine:'Continental', isSpecial:false, image:'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80' },
  { name:'Watermelon Cooler', description:'Fresh watermelon juice with mint & black salt', price:110, category:'Mocktails', type:'veg', spiceLevel:'mild', cuisine:'Healthy', isSpecial:false, tags:['healthy','refreshing'], image:'https://images.unsplash.com/photo-1614163-0625-8d3e-b5b0-dbc3e4c0a6d3?w=400&q=80' },

  // ── DESSERTS ─────────────────────────────────────────────────
  { name:'Gulab Jamun', description:'Soft milk-solid dumplings soaked in rose-flavoured sugar syrup', price:90, category:'Dessert', type:'veg', spiceLevel:'mild', cuisine:'Indian', isSpecial:false, image:'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&q=80' },
  { name:'Ice Cream (2 scoops)', description:'Choice of chocolate, vanilla or strawberry ice cream', price:110, category:'Dessert', type:'veg', spiceLevel:'mild', cuisine:'Continental', isSpecial:false, image:'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nottee9');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Menu.deleteMany({});
    await Admin.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert menu items
    await Menu.insertMany(MENU_ITEMS);
    console.log(`🌶️  Seeded ${MENU_ITEMS.length} menu items`);

    // Create default admin
    await Admin.create({
      name    : 'NOTTEE9 Admin',
      email   : process.env.ADMIN_EMAIL   || 'admin@nottee9.in',
      password: process.env.ADMIN_PASSWORD || 'nottee9@admin',
      role    : 'super-admin',
    });
    console.log('👤 Admin account created');
    console.log(`   Email:    ${process.env.ADMIN_EMAIL    || 'admin@nottee9.in'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'nottee9@admin'}`);
    console.log('\n✅ Database seeded successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
