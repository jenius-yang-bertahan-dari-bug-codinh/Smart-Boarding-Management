"use client";

import React, { useState, useEffect } from 'react';
import AdminNavbar from '@/components/AdminNavbar';
import { getAdminRooms, assignMemberToRoom, addRoom, updateRoom } from '@/app/actions/properties';
import { getAllMembers } from '@/app/actions/billing';
import { 
  Building, 
  Search, 
  X, 
  UserPlus, 
  DoorOpen,
  DoorClosed,
  Wrench,
  CheckCircle,
  AlertCircle,
  Pencil
} from 'lucide-react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Assign Resident Modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [membersList, setMembersList] = useState<any[]>([]);

  // Add/Edit Room Modal state
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('1');
  const [newRoomType, setNewRoomType] = useState('Standard');
  const [newRoomPrice, setNewRoomPrice] = useState('');
  const [editRoomStatus, setEditRoomStatus] = useState('Available');

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    const res = await getAdminRooms();
    if (res.success && res.data) {
      setRooms(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
    getAllMembers().then(res => {
      if (res.success && res.data) setMembersList(res.data);
    });
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAssignResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedRoomId) {
      showToast('Please select a resident and room', 'error');
      return;
    }

    const res = await assignMemberToRoom(parseInt(selectedMemberId), parseInt(selectedRoomId));

    if (res.success) {
      showToast(`Resident successfully assigned to room!`, 'success');
      setActiveModal(null);
      setSelectedMemberId(''); setSelectedRoomId('');
      fetchRooms(); // refresh list
    } else {
      showToast(res.error || 'Failed to assign resident', 'error');
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber || !newRoomFloor || !newRoomType || !newRoomPrice) {
      showToast('Please fill all fields', 'error');
      return;
    }
    const res = await addRoom({
      room_number: newRoomNumber,
      floor: parseInt(newRoomFloor),
      type: newRoomType,
      price: parseFloat(newRoomPrice)
    });

    if (res.success) {
      showToast('Room added successfully!', 'success');
      setActiveModal(null);
      setNewRoomNumber(''); setNewRoomFloor('1'); setNewRoomType('Standard'); setNewRoomPrice('');
      fetchRooms();
    } else {
      showToast(res.error || 'Failed to add room', 'error');
    }
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber || !newRoomFloor || !newRoomType || !newRoomPrice) {
      showToast('Please fill all fields', 'error');
      return;
    }
    const res = await updateRoom(parseInt(selectedRoomId), {
      room_number: newRoomNumber,
      floor: parseInt(newRoomFloor),
      type: newRoomType,
      price: parseFloat(newRoomPrice),
      status: editRoomStatus
    });

    if (res.success) {
      showToast('Room updated successfully!', 'success');
      setActiveModal(null);
      setNewRoomNumber(''); setNewRoomFloor('1'); setNewRoomType('Standard'); setNewRoomPrice('');
      fetchRooms();
    } else {
      showToast(res.error || 'Failed to update room', 'error');
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.roomNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.member?.name && room.member.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      <AdminNavbar activeTab="Rooms" />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right fade-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        </div>
      )}

      <main className="flex-grow pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Rooms Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage room assignments and occupancy.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by room or resident..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-shadow"
              />
            </div>
            <button
              onClick={() => setActiveModal('add_room')}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md transition-colors"
            >
              Add Room
            </button>
          </div>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No rooms found</h3>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => {
              const isEmpty = room.status !== 'Active Member' && room.status !== 'Maintenance';
              const isOccupied = room.status === 'Active Member';
              const isMaintenance = room.status === 'Maintenance';

              return (
                <div 
                  key={room.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isEmpty ? 'bg-emerald-50 text-emerald-600' :
                        isOccupied ? 'bg-blue-50 text-blue-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {isEmpty ? <DoorOpen className="w-5 h-5" /> : 
                         isOccupied ? <DoorClosed className="w-5 h-5" /> : 
                         <Wrench className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unit {room.roomNo}</h3>
                        <p className="text-xs font-semibold text-slate-500">{room.type} • {room.floor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setNewRoomNumber(room.roomNo);
                          setNewRoomFloor(room.floor.replace('Floor ', ''));
                          setNewRoomType(room.type);
                          setNewRoomPrice(room.price.replace('$', '').replace(/,/g, ''));
                          setEditRoomStatus(isOccupied ? 'Occupied' : (isMaintenance ? 'Maintenance' : 'Available'));
                          setActiveModal('edit_room');
                        }}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit Room"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${
                        isEmpty ? 'bg-emerald-100 text-emerald-700' :
                        isOccupied ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {isEmpty ? 'Available' : isOccupied ? 'Occupied' : 'Maintenance'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 mb-4">
                    {isOccupied && room.member ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">Current Resident</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{room.member.name}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{room.member.email}</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full py-2">
                        <p className="text-xs font-medium text-slate-500">No active resident.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-slate-900 dark:text-white">{room.price}<span className="text-xs text-slate-500 font-medium">/mo</span></span>
                    
                    {isEmpty && (
                      <button
                        onClick={() => {
                          setSelectedRoomId(room.id);
                          setActiveModal('assign_resident');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Assign Resident Modal */}
      {activeModal === 'assign_resident' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assign Resident</h3>
                <p className="text-xs text-slate-500 mt-0.5">Unit {rooms.find(r => r.id === selectedRoomId)?.roomNo}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignResident} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Resident</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                >
                  <option value="" disabled>Choose a resident...</option>
                  {membersList.map(m => (
                    <option key={m.id} value={m.id}>{m.name} {m.room ? `(Room ${m.room.room_number})` : ''}</option>
                  ))}
                </select>
                <p className="mt-2 text-[10px] text-slate-500 font-medium leading-relaxed">
                  Only members who are registered in the system can be assigned to a room. Assigning a member will move them from their current room if they already have one.
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Assign Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {activeModal === 'add_room' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Room</h3>
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Floor</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Monthly Price ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="250.00"
                    value={newRoomPrice}
                    onChange={(e) => setNewRoomPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Room Type</label>
                <select
                  required
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {activeModal === 'edit_room' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Room</h3>
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Floor</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Monthly Price ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="250.00"
                    value={newRoomPrice}
                    onChange={(e) => setNewRoomPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Room Type</label>
                  <select
                    required
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
                  <select
                    required
                    value={editRoomStatus}
                    onChange={(e) => setEditRoomStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow disabled:opacity-50"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                  {editRoomStatus !== 'Occupied' && (
                    <p className="mt-2 text-[10px] text-orange-500 font-medium leading-relaxed">
                      Warning: Changing status to {editRoomStatus} will automatically remove the current resident from this room.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
