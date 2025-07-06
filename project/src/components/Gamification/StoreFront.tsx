import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Coins, 
  ShoppingCart, 
  Filter,
  Search,
  Star,
  Gift,
  Crown,
  Palette,
  FileText,
  Percent,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';
import { StoreItem, UserPurchase } from '../../types/gamification';
import { STORE_ITEM_TYPES } from '../../types/gamification';
import { GiftModal } from './GiftModal';

export function StoreFront() {
  const { 
    loadStoreItems, 
    loadUserPurchases, 
    purchaseItem, 
    storeItems, 
    userPurchases, 
    stats, 
    loading, 
    error 
  } = useGamification();
  
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [giftType, setGiftType] = useState<'coins' | 'item'>('coins');
  const [giftItemId, setGiftItemId] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadStoreItems();
    loadUserPurchases();
  }, [loadStoreItems, loadUserPurchases]);

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'avatar_frame': return <Crown className="w-5 h-5" />;
      case 'profile_background': return <Palette className="w-5 h-5" />;
      case 'certificate_theme': return <FileText className="w-5 h-5" />;
      case 'course_discount': return <Percent className="w-5 h-5" />;
      case 'premium_feature': return <Zap className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const getItemTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'avatar_frame': return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'profile_background': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'certificate_theme': return 'text-green-600 bg-green-100 border-green-200';
      case 'course_discount': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'premium_feature': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const isItemOwned = (itemId: string) => {
    return userPurchases.some(purchase => purchase.item_id === itemId);
  };

  const getItemPurchase = (itemId: string): UserPurchase | undefined => {
    return userPurchases.find(purchase => purchase.item_id === itemId);
  };

  const filteredItems = storeItems.filter(item => {
    const matchesType = filterType === 'all' || item.item_type === filterType;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const handlePurchase = async (item: StoreItem, quantity: number = 1) => {
    setPurchaseLoading(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);

    try {
      await purchaseItem(item.id, quantity);
      setPurchaseSuccess(`Successfully purchased ${item.name}!`);
      setSelectedItem(null);
    } catch (err: any) {
      setPurchaseError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">⚠️</div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Store</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Store className="w-6 h-6 text-green-500" />
            Store
          </h2>
          <p className="text-gray-600">Spend your coins on exclusive items and features</p>
        </div>
        
        {/* User Balance and Gift Coins Button */}
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">{stats?.coins || 0}</span>
            <button
              className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200"
              onClick={() => { setGiftType('coins'); setGiftModalOpen(true); }}
            >
              Gift Coins
            </button>
          </div>
          <div className="text-sm text-gray-600">Available Coins</div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {purchaseSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{purchaseSuccess}</p>
        </div>
      )}

      {purchaseError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">{purchaseError}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Items</option>
            {Object.entries(STORE_ITEM_TYPES).map(([key, description]) => (
              <option key={key} value={key}>
                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const owned = isItemOwned(item.id);
          const canAfford = (stats?.coins || 0) >= item.price;
          
          return (
            <div
              key={item.id}
              className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                owned 
                  ? 'border-green-200' 
                  : canAfford 
                    ? 'border-gray-200 hover:border-green-300 cursor-pointer' 
                    : 'border-gray-200 opacity-60'
              }`}
              onClick={() => !owned && canAfford && setSelectedItem(item)}
            >
              {/* Owned Indicator */}
              {owned && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              )}

              {/* Item Icon */}
              <div className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  owned ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gray-100'
                }`}>
                  {item.icon_url ? (
                    <img 
                      src={item.icon_url} 
                      alt={item.name}
                      className={`w-8 h-8 ${owned ? 'filter brightness-0 invert' : ''}`}
                    />
                  ) : (
                    <div className={`w-8 h-8 ${owned ? 'text-white' : 'text-gray-400'}`}>
                      {getItemIcon(item.item_type)}
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                {/* Item Type Badge */}
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getItemTypeColor(item.item_type)}`}>
                  {getItemIcon(item.item_type)}
                  {item.item_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </div>

                {/* Price */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-gray-900">{item.price.toLocaleString()}</span>
                </div>

                {/* Status */}
                <div className="mt-2 text-xs">
                  {owned ? (
                    <span className="text-green-600">Owned</span>
                  ) : canAfford ? (
                    <span className="text-blue-600">Available</span>
                  ) : (
                    <span className="text-red-600">Not enough coins</span>
                  )}
                </div>

                {/* Gift Button (if not owned) */}
                {!owned && (
                  <button
                    className="mt-3 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200 flex items-center gap-1"
                    onClick={e => { e.stopPropagation(); setGiftType('item'); setGiftItemId(item.id); setGiftModalOpen(true); }}
                  >
                    <Gift className="w-4 h-4" /> Gift
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Purchase History */}
      {userPurchases.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase History</h3>
          <div className="space-y-3">
            {userPurchases.slice(0, 5).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{purchase.item?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(purchase.purchased_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{purchase.quantity}x</p>
                  <p className="text-sm text-gray-500">{purchase.total_cost} coins</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Purchase Item</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center space-y-4">
              {/* Item Icon */}
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                {selectedItem.icon_url ? (
                  <img 
                    src={selectedItem.icon_url} 
                    alt={selectedItem.name}
                    className="w-10 h-10"
                  />
                ) : (
                  <div className="w-10 h-10 text-gray-400">
                    {getItemIcon(selectedItem.item_type)}
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedItem.name}</h4>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
              </div>

              {/* Price */}
              <div className="flex items-center justify-center gap-2 text-lg">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-900">{selectedItem.price.toLocaleString()}</span>
                <span className="text-gray-600">coins</span>
              </div>

              {/* User Balance */}
              <div className="text-sm text-gray-600">
                Your balance: {(stats?.coins || 0).toLocaleString()} coins
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => handlePurchase(selectedItem)}
                disabled={purchaseLoading || (stats?.coins || 0) < selectedItem.price}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                {purchaseLoading ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Modal */}
      <GiftModal
        open={giftModalOpen}
        onClose={() => setGiftModalOpen(false)}
        giftType={giftType}
        itemId={giftType === 'item' ? giftItemId : undefined}
      />
    </div>
  );
} 