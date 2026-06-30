import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  User, 
  Utensils, 
  Trash2, 
  Plus, 
  Minus, 
  Settings, 
  Printer, 
  PlusCircle, 
  Edit3, 
  Lock, 
  Database, 
  LogOut, 
  TrendingUp, 
  Check, 
  X, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { supabase, hasSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from './supabase';

// ข้อมูลเมนูตัวอย่างกรณีรันใน Demo Mode
const DEMO_CATEGORIES = [
  { id: 1, name: 'อาหารจานเดี่ยว', display_order: 1 },
  { id: 2, name: 'ของทานเล่น', display_order: 2 },
  { id: 3, name: 'ของหวาน', display_order: 3 },
  { id: 4, name: 'เครื่องดื่ม', display_order: 4 }
];

const DEMO_MENU_ITEMS = [
  { id: 1, name: 'ข้าวกะเพราหมูสับไข่ดาว', description: 'ข้าวสวยร้อนๆ ราดกะเพราหมูสับรสชาติจัดจ้าน พร้อมไข่ดาวกรอบ', price: 75.00, image_url: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=500&auto=format&fit=crop&q=60', category_id: 1, is_available: true },
  { id: 2, name: 'ข้าวผัดปู', description: 'ข้าวผัดปูเมล็ดร่วนหอมกลิ่นกระทะ เนื้อปูเน้นๆ เสิร์ฟพร้อมมะนาวและแตงกวา', price: 90.00, image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60', category_id: 1, is_available: true },
  { id: 3, name: 'ผัดไทยกุ้งสด', description: 'ผัดไทยเส้นเหนียวนุ่ม ผัดกับซอสมะขามสูตรพิเศษและกุ้งสดตัวโต', price: 85.00, image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500&auto=format&fit=crop&q=60', category_id: 1, is_available: true },
  { id: 4, name: 'ปีกไก่ทอดน้ำปลา', description: 'ปีกไก่หมักน้ำปลาสูตรเด็ด ทอดจนสีเหลืองกรอบนอกนุ่มใน', price: 119.00, image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=60', category_id: 2, is_available: true },
  { id: 5, name: 'เฟรนช์ฟรายส์ซอสมะเขือเทศ', description: 'เฟรนช์ฟรายส์ชิ้นโตทอดร้อนๆ โรยเกลือเล็กน้อย เสิร์ฟพร้อมซอส', price: 69.00, image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60', category_id: 2, is_available: true },
  { id: 6, name: 'ข้าวเหนียวมะม่วง', description: 'ข้าวเหนียวมูนราดน้ำกะทิหอมหวาน ทานคู่กับมะม่วงน้ำดอกไม้สุก', price: 120.00, image_url: 'https://images.unsplash.com/photo-1528279027-68f0d7fce9f1?w=500&auto=format&fit=crop&q=60', category_id: 3, is_available: true },
  { id: 7, name: 'บิงซูชาไทย', description: 'เกล็ดหิมะรสชาไทยเข้มข้น ท็อปปิ้งด้วยเฉาก๊วยและนมข้นหวาน', price: 149.00, image_url: 'https://images.unsplash.com/photo-1518013041235-0133b2894867?w=500&auto=format&fit=crop&q=60', category_id: 3, is_available: true },
  { id: 8, name: 'ชาไทยเย็น', description: 'ชาไทยชงสดสไตล์ดั้งเดิม หวานมันกลมกล่อม', price: 45.00, image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60', category_id: 4, is_available: true },
  { id: 9, name: 'อเมริกาโน่เย็น', description: 'กาแฟอาราบิก้าแท้สกัดช็อตเข้มข้นผสมน้ำเย็น ดื่มแล้วสดชื่น', price: 55.00, image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60', category_id: 4, is_available: true }
];

export default function App() {
  const [useCloud, setUseCloud] = useState(hasSupabaseConfig());
  const [setupOpen, setSetupOpen] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(localStorage.getItem('supabase_url') || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(localStorage.getItem('supabase_anon_key') || '');
  
  // โหมดหลักของระบบ: 'customer' หรือ 'staff'
  const [appMode, setAppMode] = useState('customer'); 

  // ข้อมูลตารางหลัก (ดึงจาก Supabase หรือ Local Storage)
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  
  // โต๊ะของลูกค้าปัจจุบัน
  const [tableNumber, setTableNumber] = useState(localStorage.getItem('table_number') || '1');
  const [orderType, setOrderType] = useState('dine-in'); // 'dine-in' หรือ 'takeaway'
  const [tableSelectorOpen, setTableSelectorOpen] = useState(!localStorage.getItem('table_number'));

  // ตะกร้าสินค้า
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // รายการคำสั่งซื้อของลูกค้านี้ (อิงตามเบอร์โต๊ะ/Session)
  const [myOrders, setMyOrders] = useState([]);
  const [myOrdersOpen, setMyOrdersOpen] = useState(false);

  // ระบบเข้าสู่ระบบพนักงาน
  const [staffPin, setStaffPin] = useState('');
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [staffRole, setStaffRole] = useState(null); // 'staff' หรือ 'admin'
  const [staffName, setStaffName] = useState('');
  const [staffView, setStaffView] = useState('orders'); // 'orders', 'menu', 'dashboard', 'settings'

  // สำหรับรายละเอียดพิมพ์ใบเสร็จ
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [receiptItems, setReceiptItems] = useState([]);

  // จัดการฟอร์มแก้ไขเมนูอาหาร (Admin)
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuFormOpen, setMenuFormOpen] = useState(false);
  const [menuForm, setMenuForm] = useState({ name: '', description: '', price: '', image_url: '', category_id: '', is_available: true });

  // โหลดข้อมูลตามโหมดการเชื่อมต่อ
  useEffect(() => {
    loadInitialData();
  }, [useCloud]);

  const loadInitialData = async () => {
    if (useCloud && supabase) {
      try {
        const { data: cats, error: err1 } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        if (err1) throw err1;
        setCategories(cats || []);

        const { data: items, error: err2 } = await supabase
          .from('menu_items')
          .select('*')
          .order('id', { ascending: true });
        if (err2) throw err2;
        setMenuItems(items || []);

        const { data: ords, error: err3 } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (err3) throw err3;
        setOrders(ords || []);

        const { data: oitems, error: err4 } = await supabase
          .from('order_items')
          .select('*');
        if (err4) throw err4;
        setOrderItems(oitems || []);
      } catch (error) {
        console.error('Error loading from Supabase:', error.message);
        alert('โหลดข้อมูลจาก Supabase ไม่สำเร็จ ระบบจะเปลี่ยนเป็น Demo Mode ชั่วคราว');
        setUseCloud(false);
      }
    } else {
      // โหมด Demo Mode (โหลดจาก Local Storage หรือใช้ Seed)
      const localCats = localStorage.getItem('demo_categories');
      const localItems = localStorage.getItem('demo_menu_items');
      const localOrders = localStorage.getItem('demo_orders');
      const localOrderItems = localStorage.getItem('demo_order_items');

      if (!localCats || !localItems) {
        localStorage.setItem('demo_categories', JSON.stringify(DEMO_CATEGORIES));
        localStorage.setItem('demo_menu_items', JSON.stringify(DEMO_MENU_ITEMS));
        localStorage.setItem('demo_orders', JSON.stringify([]));
        localStorage.setItem('demo_order_items', JSON.stringify([]));
        
        setCategories(DEMO_CATEGORIES);
        setMenuItems(DEMO_MENU_ITEMS);
        setOrders([]);
        setOrderItems([]);
      } else {
        setCategories(JSON.parse(localCats));
        setMenuItems(JSON.parse(localItems));
        setOrders(JSON.parse(localOrders || '[]'));
        setOrderItems(JSON.parse(localOrderItems || '[]'));
      }
    }
  };

  // Real-time listener (ใช้ได้เมื่อเปิด Supabase Cloud Mode)
  useEffect(() => {
    if (!useCloud || !supabase) return;

    const ordersSubscription = supabase
      .channel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        loadInitialData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, [useCloud]);

  useEffect(() => {
    if (!orders || orders.length === 0) {
      setMyOrders([]);
      return;
    }
    const filtered = orders.filter(o => o.table_number === tableNumber && o.status !== 'completed' && o.status !== 'cancelled');
    setMyOrders(filtered);
  }, [orders, tableNumber]);

  // ฟังก์ชันของลูกค้า
  const handleSelectTable = (num, type) => {
    setTableNumber(num);
    setOrderType(type);
    localStorage.setItem('table_number', num);
    setTableSelectorOpen(false);
  };

  const handleOpenAddFoodModal = (food) => {
    setSelectedFood({ ...food, quantity: 1, notes: '' });
  };

  const handleAddToCart = () => {
    const existing = cart.find(i => i.item.id === selectedFood.id && i.notes === selectedFood.notes);
    if (existing) {
      setCart(cart.map(i => 
        i.item.id === selectedFood.id && i.notes === selectedFood.notes
          ? { ...i, quantity: i.quantity + selectedFood.quantity }
          : i
      ));
    } else {
      setCart([...cart, { item: selectedFood, quantity: selectedFood.quantity, notes: selectedFood.notes }]);
    }
    setSelectedFood(null);
  };

  const updateCartQty = (index, delta) => {
    const updated = cart.map((item, idx) => {
      if (idx === index) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    setCart(updated);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);

    if (useCloud && supabase) {
      try {
        const { data: newOrder, error: err1 } = await supabase
          .from('orders')
          .insert([{
            table_number: tableNumber,
            order_type: orderType,
            total_price: total,
            status: 'pending'
          }])
          .select()
          .single();

        if (err1) throw err1;

        const itemsToInsert = cart.map(item => ({
          order_id: newOrder.id,
          menu_item_id: item.item.id,
          quantity: item.quantity,
          notes: item.notes,
          unit_price: item.item.price
        }));

        const { error: err2 } = await supabase
          .from('order_items')
          .insert(itemsToInsert);

        if (err2) throw err2;

        setCart([]);
        setCartOpen(false);
        setMyOrdersOpen(true);
        loadInitialData();
        alert('ส่งคำสั่งซื้อของคุณเข้าห้องครัวเรียบร้อยแล้วครับ!');
      } catch (error) {
        console.error('Error placing order:', error.message);
        alert('การสั่งซื้อขัดข้อง กรุณาลองอีกครั้ง');
      }
    } else {
      // Demo Mode (LocalStorage)
      const newOrderId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
      const newOrder = {
        id: newOrderId,
        table_number: tableNumber,
        order_type: orderType,
        total_price: total,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const newOrderItems = cart.map((item, idx) => ({
        id: orderItems.length + idx + 1,
        order_id: newOrderId,
        menu_item_id: item.item.id,
        quantity: item.quantity,
        notes: item.notes,
        unit_price: item.item.price
      }));

      const updatedOrders = [newOrder, ...orders];
      const updatedOrderItems = [...orderItems, ...newOrderItems];

      localStorage.setItem('demo_orders', JSON.stringify(updatedOrders));
      localStorage.setItem('demo_order_items', JSON.stringify(updatedOrderItems));

      setOrders(updatedOrders);
      setOrderItems(updatedOrderItems);
      setCart([]);
      setCartOpen(false);
      setMyOrdersOpen(true);
      alert('ส่งคำสั่งซื้อของคุณเข้าห้องครัวเรียบร้อยแล้วครับ! (Demo Mode)');
    }
  };

  // พนักงานหลังร้าน
  const handleStaffLogin = () => {
    if (staffPin === '1234') {
      setIsStaffLoggedIn(true);
      setStaffRole('staff');
      setStaffName('พนักงานกะเช้า');
      setStaffPin('');
    } else if (staffPin === '9999') {
      setIsStaffLoggedIn(true);
      setStaffRole('admin');
      setStaffName('ผู้จัดการร้าน');
      setStaffPin('');
    } else {
      alert('รหัส PIN พนักงานไม่ถูกต้อง (ลองใส่ 1234 สำหรับพนักงาน หรือ 9999 สำหรับผู้จัดการ)');
      setStaffPin('');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (useCloud && supabase) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);
        if (error) throw error;
        loadInitialData();
      } catch (error) {
        console.error('Update status error:', error.message);
      }
    } else {
      const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      localStorage.setItem('demo_orders', JSON.stringify(updated));
      setOrders(updated);
    }
  };

  const getOrderItemsList = (orderId) => {
    return orderItems
      .filter(oi => oi.order_id === orderId)
      .map(oi => {
        const food = menuItems.find(f => f.id === oi.menu_item_id);
        return {
          ...oi,
          foodName: food ? food.name : 'อาหารรายการอื่น'
        };
      });
  };

  // สั่งพิมพ์ใบเสร็จ
  const handlePrintReceipt = (order) => {
    const items = getOrderItemsList(order.id);
    setReceiptOrder(order);
    setReceiptItems(items);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // แอดมินจัดการเมนู
  const handleOpenMenuForm = (item = null) => {
    if (item) {
      setEditingMenuItem(item);
      setMenuForm({
        name: item.name,
        description: item.description || '',
        price: item.price,
        image_url: item.image_url || '',
        category_id: item.category_id || '',
        is_available: item.is_available
      });
    } else {
      setEditingMenuItem(null);
      setMenuForm({ name: '', description: '', price: '', image_url: '', category_id: categories[0]?.id || '', is_available: true });
    }
    setMenuFormOpen(true);
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.price) return;

    if (useCloud && supabase) {
      try {
        if (editingMenuItem) {
          const { error } = await supabase
            .from('menu_items')
            .update(menuForm)
            .eq('id', editingMenuItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('menu_items')
            .insert([menuForm]);
          if (error) throw error;
        }
        setMenuFormOpen(false);
        loadInitialData();
      } catch (error) {
        console.error('Error saving menu item:', error.message);
      }
    } else {
      let updatedItems;
      if (editingMenuItem) {
        updatedItems = menuItems.map(item => 
          item.id === editingMenuItem.id 
            ? { ...item, ...menuForm, price: parseFloat(menuForm.price) }
            : item
        );
      } else {
        const newItemId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
        updatedItems = [...menuItems, {
          id: newItemId,
          ...menuForm,
          price: parseFloat(menuForm.price)
        }];
      }
      localStorage.setItem('demo_menu_items', JSON.stringify(updatedItems));
      setMenuItems(updatedItems);
      setMenuFormOpen(false);
      alert('บันทึกเมนูสำเร็จแล้วครับ!');
    }
  };

  const handleToggleAvailable = async (item) => {
    const nextVal = !item.is_available;
    if (useCloud && supabase) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .update({ is_available: nextVal })
          .eq('id', item.id);
        if (error) throw error;
        loadInitialData();
      } catch (error) {
        console.error('Error toggling availability:', error.message);
      }
    } else {
      const updated = menuItems.map(i => i.id === item.id ? { ...i, is_available: nextVal } : i);
      localStorage.setItem('demo_menu_items', JSON.stringify(updated));
      setMenuItems(updated);
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการอาหารนี้?')) return;
    if (useCloud && supabase) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', id);
        if (error) throw error;
        loadInitialData();
      } catch (error) {
        console.error('Error deleting menu item:', error.message);
      }
    } else {
      const updated = menuItems.filter(i => i.id !== id);
      localStorage.setItem('demo_menu_items', JSON.stringify(updated));
      setMenuItems(updated);
    }
  };

  // การตั้งค่า Supabase
  const handleSaveSetup = () => {
    if (!supabaseUrlInput || !supabaseKeyInput) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
  };

  const handleClearSetup = () => {
    if (confirm('คุณต้องการตัดการเชื่อมต่อและลบ API Keys จากบราวเซอร์นี้ใช่หรือไม่?')) {
      clearSupabaseConfig();
    }
  };

  const stats = {
    todaySales: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.total_price), 0),
    activeOrders: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length
  };

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* เมนูบาร์หลักสำหรับ Client/Staff */}
      {/* ---------------------------------------------------- */}
      <nav className="header-nav">
        <div className="container header-container">
          <a href="#" className="logo" onClick={() => setAppMode('customer')}>
            <Utensils size={24} />
            <span>กติมา <span style={{ fontWeight: 400, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Katima Restaurant</span></span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {appMode === 'customer' ? (
              <>
                <button 
                  className="nav-btn" 
                  onClick={() => setTableSelectorOpen(true)}
                  title="เปลี่ยนเบอร์โต๊ะ"
                  style={{ backgroundColor: 'var(--bg-neutral)' }}
                >
                  <span>โต๊ะ: <strong>{tableNumber}</strong> {orderType === 'takeaway' && '(กลับบ้าน)'}</span>
                </button>

                <button 
                  className={`nav-btn ${myOrdersOpen ? 'active' : ''}`}
                  onClick={() => setMyOrdersOpen(true)}
                >
                  <ShoppingBag size={18} />
                  <span>สถานะคำสั่งซื้อ ({myOrders.length})</span>
                </button>

                <button 
                  className="nav-btn btn-secondary" 
                  onClick={() => setAppMode('staff')}
                >
                  <User size={18} />
                  <span>ระบบพนักงาน</span>
                </button>
              </>
            ) : (
              <>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  โหมดพนักงาน: <strong>{staffName || 'กรุณาเข้าสู่ระบบ'}</strong>
                </span>
                <button 
                  className="nav-btn btn-danger" 
                  onClick={() => {
                    setIsStaffLoggedIn(false);
                    setStaffRole(null);
                    setAppMode('customer');
                  }}
                >
                  <LogOut size={16} />
                  <span>ออกจากระบบ</span>
                </button>
              </>
            )}

            <button 
              className="nav-btn" 
              onClick={() => setSetupOpen(true)}
              title="ตั้งค่าฐานข้อมูล Supabase"
            >
              <Database size={18} color={useCloud ? 'var(--secondary)' : 'var(--text-light)'} />
            </button>
          </div>
        </div>
      </nav>

      {/* ---------------------------------------------------- */}
      {/* หน้าสำหรับลูกค้า (Customer Portal) */}
      {/* ---------------------------------------------------- */}
      {appMode === 'customer' && (
        <main className="container" style={{ paddingBottom: '6rem' }}>
          
          <div style={{
            background: 'linear-gradient(135deg, var(--bg-accent), #fbe9e7)',
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>ยินดีต้อนรับสู่ ร้านอาหารกติมา</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px' }}>
              สั่งอาหารผ่านหน้าเว็บออนไลน์ได้ง่ายๆ เลือกเมนูที่คุณต้องการ แล้วระบุเลขโต๊ะ จากนั้นเตรียมรับประทานอาหารร้อนๆ จากเชฟของเราได้เลย!
            </p>
            {!useCloud && (
              <div style={{ 
                marginTop: '1.25rem', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                backgroundColor: 'var(--primary-light)', 
                color: 'var(--primary)', 
                padding: '0.5rem 1rem', 
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 600
              }}>
                <AlertTriangle size={16} />
                <span>ขณะนี้กำลังใช้งานในโหมด Demo จำลองความสามารถ สั่งอาหารได้ตามปกติ!</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            <button 
              className={`btn-secondary ${selectedCategory === 'all' ? 'active' : ''}`}
              style={{
                backgroundColor: selectedCategory === 'all' ? 'var(--primary)' : 'var(--bg-card)',
                color: selectedCategory === 'all' ? 'white' : 'var(--text-main)',
                whiteSpace: 'nowrap',
                border: '1px solid var(--border)'
              }}
              onClick={() => setSelectedCategory('all')}
            >
              ทั้งหมด
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={`btn-secondary ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{
                  backgroundColor: selectedCategory === cat.id ? 'var(--primary)' : 'var(--bg-card)',
                  color: selectedCategory === cat.id ? 'white' : 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  border: '1px solid var(--border)'
                }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>รายการอาหารแนะนำ</h2>
          
          <div className="menu-grid">
            {menuItems
              .filter(item => selectedCategory === 'all' || item.category_id === selectedCategory)
              .map(item => (
                <div key={item.id} className="food-card" style={{ opacity: item.is_available ? 1 : 0.6 }}>
                  <div className="food-img-container">
                    <img 
                      src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} 
                      alt={item.name} 
                      className="food-img"
                    />
                  </div>
                  <div className="food-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className="food-title">{item.name}</h3>
                      {!item.is_available && <span className="badge badge-cancelled" style={{ fontSize: '0.75rem' }}>หมด</span>}
                    </div>
                    <p className="food-desc">{item.description}</p>
                    <div className="food-footer">
                      <span className="food-price">฿{Number(item.price).toFixed(2)}</span>
                      {item.is_available ? (
                        <button className="btn-primary" onClick={() => handleOpenAddFoodModal(item)}>
                          <Plus size={16} />
                          <span>สั่งอาหาร</span>
                        </button>
                      ) : (
                        <button className="btn-secondary" disabled>หมดชั่วคราว</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {cart.length > 0 && (
            <button className="cart-float" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={20} />
              <span>ดูตะกร้าสั่งอาหาร</span>
              <span className="cart-count">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>
          )}
        </main>
      )}

      {/* ---------------------------------------------------- */}
      {/* หน้าสำหรับพนักงาน (Staff Portal) */}
      {/* ---------------------------------------------------- */}
      {appMode === 'staff' && (
        <div style={{ minHeight: 'calc(100vh - 70px)' }}>
          {!isStaffLoggedIn ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}>
              <div style={{ 
                backgroundColor: 'var(--bg-card)', 
                padding: '2.5rem', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--border)',
                width: '100%',
                maxWidth: '380px',
                boxShadow: 'var(--shadow-md)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <Lock size={28} />
                </div>
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>ลงชื่อเข้าใช้พนักงาน</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  กรุณากรอกรหัส PIN พนักงานเพื่อเข้าจัดการร้านอาหาร
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  {[1, 2, 3, 4].map(idx => (
                    <div 
                      key={idx}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid var(--border)',
                        backgroundColor: staffPin.length >= idx ? 'var(--primary)' : 'transparent',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '0.75rem',
                  maxWidth: '280px',
                  margin: '0 auto 1.5rem'
                }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button 
                      key={num}
                      style={{
                        height: '55px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-neutral)',
                        fontSize: '1.35rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                      }}
                      onClick={() => {
                        if (staffPin.length < 4) setStaffPin(prev => prev + num);
                      }}
                    >
                      {num}
                    </button>
                  ))}
                  <button 
                    style={{
                      height: '55px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-light)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onClick={() => setStaffPin('')}
                  >
                    <RotateCcw size={20} />
                  </button>
                  <button 
                    style={{
                      height: '55px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-neutral)',
                      fontSize: '1.35rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                    }}
                    onClick={() => {
                      if (staffPin.length < 4) setStaffPin(prev => prev + '0');
                    }}
                  >
                    0
                  </button>
                  <button 
                    style={{
                      height: '55px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--secondary-light)',
                      color: 'var(--secondary)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                    onClick={handleStaffLogin}
                  >
                    <Check size={24} />
                  </button>
                </div>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  PIN ตัวอย่าง: <strong>1234</strong> (พนักงาน) หรือ <strong>9999</strong> (ผู้จัดการ)
                </p>
              </div>
            </div>
          ) : (
            <div className="dashboard-layout">
              <aside className="sidebar">
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>เมนูควบคุม</h3>
                
                <button 
                  className={`nav-btn ${staffView === 'orders' ? 'active' : ''}`}
                  onClick={() => setStaffView('orders')}
                >
                  <ShoppingBag size={18} />
                  <span>จัดออเดอร์หน้าร้าน ({stats.activeOrders})</span>
                </button>
                
                {staffRole === 'admin' && (
                  <>
                    <button 
                      className={`nav-btn ${staffView === 'menu' ? 'active' : ''}`}
                      onClick={() => setStaffView('menu')}
                    >
                      <Utensils size={18} />
                      <span>จัดการเมนูอาหาร</span>
                    </button>
                    
                    <button 
                      className={`nav-btn ${staffView === 'dashboard' ? 'active' : ''}`}
                      onClick={() => setStaffView('dashboard')}
                    >
                      <TrendingUp size={18} />
                      <span>วิเคราะห์ข้อมูลยอดขาย</span>
                    </button>
                  </>
                )}

                <button 
                  className={`nav-btn ${staffView === 'settings' ? 'active' : ''}`}
                  onClick={() => setStaffView('settings')}
                  style={{ marginTop: 'auto' }}
                >
                  <Settings size={18} />
                  <span>ตั้งค่า Supabase</span>
                </button>
              </aside>

              <main className="main-content">
                {staffView === 'orders' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>รายการสั่งอาหารสดใหม่</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>คอยดูรายการสั่งอาหารของลูกค้า ปลุกสถานะปรุงเสร็จ และสั่งเช็คบิลเพื่อพิมพ์ใบเสร็จ</p>
                      </div>
                      <button className="btn-secondary" onClick={loadInitialData}>
                        <RotateCcw size={16} />
                        <span>รีเฟรชข้อมูล</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                      {orders
                        .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
                        .map(order => {
                          const items = getOrderItemsList(order.id);
                          return (
                            <div key={order.id} style={{
                              backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-md)',
                              padding: '1.25rem',
                              boxShadow: 'var(--shadow-sm)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1rem'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                                <div>
                                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>
                                    โต๊ะ: {order.table_number}
                                  </span>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>
                                    ออเดอร์ #{order.id} | {new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <span className={`badge badge-${order.status}`}>
                                  {order.status === 'pending' && 'สั่งใหม่'}
                                  {order.status === 'cooking' && 'กำลังทำ'}
                                  {order.status === 'served' && 'เสิร์ฟแล้ว'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {items.map(item => (
                                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                    <div>
                                      <span><strong>{item.quantity}x</strong> {item.foodName}</span>
                                      {item.notes && <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--primary)', paddingLeft: '1.25rem' }}>* {item.notes}</span>}
                                    </div>
                                    <span style={{ color: 'var(--text-muted)' }}>฿{(item.unit_price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>

                              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>รวมทั้งหมด:</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>฿{Number(order.total_price).toFixed(2)}</span>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {order.status === 'pending' && (
                                  <>
                                    <button 
                                      className="btn-primary" 
                                      style={{ gridColumn: 'span 2' }}
                                      onClick={() => handleUpdateOrderStatus(order.id, 'cooking')}
                                    >
                                      รับออเดอร์ & เริ่มทำครัว
                                    </button>
                                    <button 
                                      className="btn-secondary" 
                                      onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                    >
                                      ยกเลิกออเดอร์
                                    </button>
                                  </>
                                )}
                                
                                {order.status === 'cooking' && (
                                  <button 
                                    className="btn-primary" 
                                    style={{ gridColumn: 'span 2', backgroundColor: 'var(--secondary)' }}
                                    onClick={() => handleUpdateOrderStatus(order.id, 'served')}
                                  >
                                    ปรุงเสร็จแล้ว & พร้อมเสิร์ฟ
                                  </button>
                                )}

                                {order.status === 'served' && (
                                  <>
                                    <button 
                                      className="btn-primary"
                                      style={{ backgroundColor: 'var(--secondary)' }}
                                      onClick={() => {
                                        handlePrintReceipt(order);
                                        handleUpdateOrderStatus(order.id, 'completed');
                                      }}
                                    >
                                      <Printer size={16} />
                                      <span>พิมพ์สลิป & เช็คบิล</span>
                                    </button>
                                    <button 
                                      className="btn-secondary"
                                      onClick={() => handlePrintReceipt(order)}
                                    >
                                      ดูตัวอย่างใบเสร็จ
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      
                      {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length === 0 && (
                        <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '3rem', color: 'var(--text-light)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                          <CheckCircle size={40} style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }} />
                          <p>ยังไม่มีออเดอร์รอดำเนินการในขณะนี้ครับ</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {staffView === 'menu' && staffRole === 'admin' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>จัดการเมนูอาหารในระบบ</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>เพิ่มเมนูอาหารใหม่ แก้ไขราคา เปลี่ยนรูปภาพหน้าปก หรือเปิดปิดการขายเมื่อวัตถุดิบหมด</p>
                      </div>
                      <button className="btn-primary" onClick={() => handleOpenMenuForm()}>
                        <PlusCircle size={16} />
                        <span>เพิ่มเมนูอาหารใหม่</span>
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-neutral)' }}>
                            <th style={{ padding: '1rem' }}>รูปภาพ</th>
                            <th style={{ padding: '1rem' }}>ชื่อเมนู</th>
                            <th style={{ padding: '1rem' }}>หมวดหมู่</th>
                            <th style={{ padding: '1rem' }}>ราคา</th>
                            <th style={{ padding: '1rem' }}>สถานะของ</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>เครื่องมือ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {menuItems.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <img 
                                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} 
                                  alt={item.name} 
                                  style={{ width: '55px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                />
                              </td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <strong>{item.name}</strong>
                                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.description}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                                {categories.find(c => c.id === item.category_id)?.name || 'ไม่มี'}
                              </td>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>฿{Number(item.price).toFixed(2)}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <button 
                                  style={{
                                    backgroundColor: item.is_available ? 'var(--secondary-light)' : '#ffebee',
                                    color: item.is_available ? 'var(--secondary)' : '#c62828',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.8rem',
                                    fontWeight: 600
                                  }}
                                  onClick={() => handleToggleAvailable(item)}
                                >
                                  {item.is_available ? 'พร้อมขาย' : 'ของหมด'}
                                </button>
                              </td>
                              <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                  <button 
                                    className="btn-secondary" 
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                                    onClick={() => handleOpenMenuForm(item)}
                                  >
                                    <Edit3 size={14} />
                                    <span>แก้ไข</span>
                                  </button>
                                  <button 
                                    className="btn-danger" 
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                                    onClick={() => handleDeleteMenuItem(item.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {staffView === 'dashboard' && staffRole === 'admin' && (
                  <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>การวิเคราะห์สรุปยอดขายของวันนี้</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.25rem' }}>ยอดขายรวมวันนี้</span>
                        <strong style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>฿{stats.todaySales.toFixed(2)}</strong>
                      </div>
                      <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.25rem' }}>ออเดอร์กำลังปรุง</span>
                        <strong style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>{stats.activeOrders}</strong>
                      </div>
                      <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.25rem' }}>เช็คบิลเสร็จสิ้น</span>
                        <strong style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>{stats.completedOrders}</strong>
                      </div>
                      <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', display: 'block', marginBottom: '0.25rem' }}>ออเดอร์ถูกยกเลิก</span>
                        <strong style={{ fontSize: '1.8rem', color: '#c62828' }}>{stats.cancelledOrders}</strong>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>ประวัติการทำรายการล่าสุด</h3>
                      
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-light)' }}>
                              <th style={{ padding: '0.75rem 0' }}>หมายเลขออเดอร์</th>
                              <th style={{ padding: '0.75rem 0' }}>โต๊ะ</th>
                              <th style={{ padding: '0.75rem 0' }}>เวลาทำรายการ</th>
                              <th style={{ padding: '0.75rem 0' }}>ยอดรวม</th>
                              <th style={{ padding: '0.75rem 0' }}>สถานะ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders
                              .filter(o => o.status === 'completed' || o.status === 'cancelled')
                              .map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '0.75rem 0' }}>#{order.id}</td>
                                  <td style={{ padding: '0.75rem 0' }}>โต๊ะ {order.table_number}</td>
                                  <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>
                                    {new Date(order.created_at).toLocaleTimeString('th-TH')}
                                  </td>
                                  <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>฿{Number(order.total_price).toFixed(2)}</td>
                                  <td style={{ padding: '0.75rem 0' }}>
                                    <span className={`badge badge-${order.status}`}>
                                      {order.status === 'completed' ? 'ชำระเงินแล้ว' : 'ยกเลิก'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {staffView === 'settings' && (
                  <div style={{ maxWidth: '600px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>ตั้งค่าการเชื่อมต่อฐานข้อมูล</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                      เชื่อมต่อกับ Supabase ของคุณเพื่อเก็บข้อมูลออเดอร์และเมนูอาหารแบบถาวรและรองรับการสั่งซื้อแบบ Realtime 
                    </p>

                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                          สถานะการเชื่อมต่อปัจจุบัน:
                        </label>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9rem', backgroundColor: useCloud ? 'var(--secondary-light)' : '#fff8e1', color: useCloud ? 'var(--secondary)' : '#b78103' }}>
                          <Database size={16} />
                          <span>{useCloud ? 'เชื่อมต่อ Supabase Cloud สำเร็จ' : 'อยู่ในโหมด Demo (บันทึกเฉพาะใน Browser)'}</span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', margin: '1.5rem 0', paddingTop: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 700 }}>แก้ไข API Credentials</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Supabase URL</label>
                            <input 
                              type="text" 
                              className="btn-secondary"
                              style={{ width: '100%', textAlign: 'left', backgroundColor: 'var(--bg-main)' }}
                              placeholder="https://xxxx.supabase.co"
                              value={supabaseUrlInput}
                              onChange={(e) => setSupabaseUrlInput(e.target.value)}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Supabase Anon Key</label>
                            <input 
                              type="password" 
                              className="btn-secondary"
                              style={{ width: '100%', textAlign: 'left', backgroundColor: 'var(--bg-main)' }}
                              placeholder="eyJhbGciOi..."
                              value={supabaseKeyInput}
                              onChange={(e) => setSupabaseKeyInput(e.target.value)}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <button className="btn-primary" onClick={handleSaveSetup}>
                              บันทึกข้อมูลและรีโหลด
                            </button>
                            {useCloud && (
                              <button className="btn-danger" onClick={handleClearSetup}>
                                ล้างการเชื่อมต่อ
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* รายละเอียด Modals ต่างๆ */}
      {/* ---------------------------------------------------- */}

      {/* 1. Modal เลือกเบอร์โต๊ะ (สำหรับลูกค้ารันครั้งแรก) */}
      {tableSelectorOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>ยินดีต้อนรับสู่ ร้านกติมา</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>กรุณาระบุหมายเลขโต๊ะเพื่อเริ่มสั่งอาหารผ่านระบบ</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>หมายเลขโต๊ะ:</span>
                <select 
                  className="btn-secondary"
                  style={{ width: '120px', fontSize: '1.1rem', padding: '0.5rem' }}
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                >
                  {[...Array(20).keys()].map(i => (
                    <option key={i+1} value={i+1}>โต๊ะ {i+1}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', margin: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="ordertype" 
                    checked={orderType === 'dine-in'} 
                    onChange={() => setOrderType('dine-in')}
                  />
                  <span>ทานที่ร้าน</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="ordertype" 
                    checked={orderType === 'takeaway'} 
                    onChange={() => {
                      setOrderType('takeaway');
                      setTableNumber('Takeaway');
                    }}
                  />
                  <span>สั่งกลับบ้าน</span>
                </label>
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                onClick={() => handleSelectTable(tableNumber, orderType)}
              >
                เริ่มสั่งอาหารเลย
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal ปรับแต่ง/สั่งรายการอาหาร */}
      {selectedFood && (
        <div className="modal-overlay" onClick={() => setSelectedFood(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedFood(null)}>
              <X size={20} />
            </button>
            
            <img 
              src={selectedFood.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'} 
              alt={selectedFood.name} 
              style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}
            />
            
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.35rem' }}>{selectedFood.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>{selectedFood.description}</p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                ความต้องการพิเศษ (ถ้ามี):
              </label>
              <input 
                type="text"
                placeholder="เช่น ไม่ใส่ผักชี, เผ็ดน้อย, ไข่ดาวไม่สุก..."
                className="btn-secondary"
                style={{ width: '100%', textAlign: 'left', padding: '0.75rem', backgroundColor: 'var(--bg-main)' }}
                value={selectedFood.notes}
                onChange={(e) => setSelectedFood({ ...selectedFood, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>
                  ฿{(selectedFood.price * selectedFood.quantity).toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className="btn-secondary" 
                  style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center', borderRadius: '50%' }}
                  onClick={() => selectedFood.quantity > 1 && setSelectedFood({ ...selectedFood, quantity: selectedFood.quantity - 1 })}
                >
                  <Minus size={16} />
                </button>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, width: '20px', textAlign: 'center' }}>
                  {selectedFood.quantity}
                </span>
                <button 
                  className="btn-secondary" 
                  style={{ width: '36px', height: '36px', padding: 0, justifyContent: 'center', borderRadius: '50%' }}
                  onClick={() => setSelectedFood({ ...selectedFood, quantity: selectedFood.quantity + 1 })}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
              onClick={handleAddToCart}
            >
              <ShoppingBag size={18} />
              <span>ใส่ตะกร้าออเดอร์</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Modal ตะกร้าสินค้า */}
      {cartOpen && (
        <div className="modal-overlay" onClick={() => setCartOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setCartOpen(false)}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              ตะกร้าสั่งอาหาร (โต๊ะ {tableNumber})
            </h3>

            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-light)' }}>ไม่มีอาหารในตะกร้าของคุณ</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '50vh', overflowY: 'auto', marginBottom: '1.5rem' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--bg-neutral)', paddingBottom: '0.75rem' }}>
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ fontWeight: 600 }}>{item.item.name}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>฿{Number(item.item.price).toFixed(2)}</span>
                        {item.notes && <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>* {item.notes}</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ width: '28px', height: '28px', padding: 0, justifyContent: 'center', borderRadius: '50%' }}
                          onClick={() => updateCartQty(idx, -1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: '15px', textAlign: 'center' }}>{item.quantity}</span>
                        <button 
                          className="btn-secondary" 
                          style={{ width: '28px', height: '28px', padding: 0, justifyContent: 'center', borderRadius: '50%' }}
                          onClick={() => updateCartQty(idx, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.25rem', fontWeight: 700 }}>
                    <span>ยอดรวมทั้งหมด:</span>
                    <span style={{ color: 'var(--primary)' }}>
                      ฿{cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                  onClick={handlePlaceOrder}
                >
                  ยืนยันและส่งคำสั่งซื้อ
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. Modal ติดตามสถานะออเดอร์ของลูกค้า */}
      {myOrdersOpen && (
        <div className="modal-overlay" onClick={() => setMyOrdersOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setMyOrdersOpen(false)}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              ติดตามสถานะอาหาร โต๊ะ {tableNumber}
            </h3>

            {myOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle size={36} color="var(--secondary)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ color: 'var(--text-light)' }}>คุณไม่มีออเดอร์ค้างส่งในครัว หรือเช็คบิลเรียบร้อยแล้ว!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                {myOrders.map(order => {
                  const items = getOrderItemsList(order.id);
                  return (
                    <div key={order.id} style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-neutral)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 600 }}>ออเดอร์ #{order.id}</span>
                        <span className={`badge badge-${order.status}`}>
                          {order.status === 'pending' && 'ห้องครัวกำลังรับรายการ'}
                          {order.status === 'cooking' && 'ห้องครัวกำลังปรุง'}
                          {order.status === 'served' && 'เสิร์ฟเสร็จสิ้น'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                        {items.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span>{item.quantity}x {item.foodName}</span>
                            <span style={{ color: 'var(--text-muted)' }}>฿{(item.unit_price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px dashed var(--border)', paddingTop: '0.5rem' }}>
                        <span>ยอดรวมออเดอร์นี้:</span>
                        <span style={{ color: 'var(--primary)' }}>฿{Number(order.total_price).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Modal ตั้งค่าด่วน Supabase (สำหรับ Gear Icon) */}
      {setupOpen && (
        <div className="modal-overlay" onClick={() => setSetupOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSetupOpen(false)}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>ตั้งค่าโปรเจกต์ Supabase</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              กรอกข้อมูลเพื่อเชื่อมต่อแอปพลิเคชันเข้ากับ Database Supabase ของคุณ
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Supabase URL</label>
                <input 
                  type="text" 
                  className="btn-secondary"
                  style={{ width: '100%', textAlign: 'left', backgroundColor: 'var(--bg-main)' }}
                  placeholder="https://xxxx.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Supabase Anon Key</label>
                <input 
                  type="password" 
                  className="btn-secondary"
                  style={{ width: '100%', textAlign: 'left', backgroundColor: 'var(--bg-main)' }}
                  placeholder="eyJhbGciOi..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button className="btn-primary" onClick={handleSaveSetup}>
                  บันทึกและเชื่อมต่อ
                </button>
                {useCloud && (
                  <button className="btn-danger" onClick={handleClearSetup}>
                    ล้างการเชื่อมต่อ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal ฟอร์มแก้ไข/เพิ่มเมนูอาหาร (Admin Only) */}
      {menuFormOpen && (
        <div className="modal-overlay" onClick={() => setMenuFormOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setMenuFormOpen(false)}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              {editingMenuItem ? 'แก้ไขเมนูอาหาร' : 'เพิ่มเมนูอาหารใหม่'}
            </h3>

            <form onSubmit={handleSaveMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>ชื่อเมนูอาหาร *</label>
                <input 
                  type="text" 
                  required
                  className="btn-secondary" 
                  style={{ width: '100%', textAlign: 'left', backgroundColor: 'var(--bg-main)' }}
                  placeholder="เช่น ข้าวผัดไข่"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>รายละเอียด</label>
                <textarea 
                  className="btn-secondary" 
                  style={{ width: '100%', textAlign: 'left', backgroundColor: 'var(--bg-main)', height: '70px', resize: 'none', padding: '0.5rem' }}
                  placeholder="คำอธิบายรสชาติหรือวัตถุดิบ..."
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>ราคา (บาท) *</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    className="btn-secondary" 
                    style={{ width: '100%', textAlign: 'left', backgroundColor: 'var(--bg-main)' }}
                    placeholder="80.00"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>หมวดหมู่</label>
                  <select 
                    className="btn-secondary" 
                    style={{ width: '100%', height: '42px', padding: '0.5rem' }}
                    value={menuForm.category_id}
                    onChange={(e) => setMenuForm({ ...menuForm, category_id: e.target.value })}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>ลิงก์รูปภาพอาหาร (URL)</label>
                <input 
                  type="text" 
                  className="btn-secondary" 
                  style={{ width: '100%', textAlign: 'left', backgroundColor: 'var(--bg-main)' }}
                  placeholder="https://images.unsplash.com/..."
                  value={menuForm.image_url}
                  onChange={(e) => setMenuForm({ ...menuForm, image_url: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
                <input 
                  type="checkbox" 
                  id="avail"
                  checked={menuForm.is_available} 
                  onChange={(e) => setMenuForm({ ...menuForm, is_available: e.target.checked })}
                />
                <label htmlFor="avail" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>พร้อมสำหรับปรุงขาย ณ ตอนนี้</label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button type="submit" className="btn-primary">
                  บันทึกข้อมูลเมนู
                </button>
                <button type="button" className="btn-secondary" onClick={() => setMenuFormOpen(false)}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 7. พิมพ์ใบเสร็จความร้อน (ซ่อนอยู่และจะถูกเรียกเมื่อสั่งพิมพ์เท่านั้น) */}
      {/* ---------------------------------------------------- */}
      {receiptOrder && (
        <div className="print-only-receipt">
          <div className="receipt-paper">
            <div className="receipt-header">
              <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>กติมา - Katima</h2>
              <p>โทร: 088-xxx-xxxx</p>
              <p>สาขาหลัก</p>
            </div>
            
            <div className="receipt-divider"></div>
            
            <p>ออเดอร์เลขที่: #{receiptOrder.id}</p>
            <p>โต๊ะ: {receiptOrder.table_number}</p>
            <p>วันที่สั่งซื้อ: {new Date(receiptOrder.created_at).toLocaleString('th-TH')}</p>
            <p>ประเภท: {receiptOrder.order_type === 'dine-in' ? 'ทานที่ร้าน' : 'กลับบ้าน'}</p>
            
            <div className="receipt-divider"></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {receiptItems.map((item, idx) => (
                <div key={idx}>
                  <div className="receipt-row">
                    <span>{item.quantity}x {item.foodName}</span>
                    <span>{(item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.notes && <span style={{ fontSize: '11px', paddingLeft: '10px' }}>* โน้ต: {item.notes}</span>}
                </div>
              ))}
            </div>
            
            <div className="receipt-divider"></div>
            
            <div className="receipt-row" style={{ fontWeight: 'bold', fontSize: '14px' }}>
              <span>ยอดรวมทั้งสิ้น (บาท):</span>
              <span>{Number(receiptOrder.total_price).toFixed(2)}</span>
            </div>
            
            <div className="receipt-divider"></div>
            
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <p>ขอบคุณที่ใช้บริการร้านอาหารกติมาครับ</p>
              <p>ยินดีต้อนรับกลับมาเยือนเสมอ</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
