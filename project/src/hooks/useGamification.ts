import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { GamificationService } from '../lib/gamification';
import { 
  UserGamificationStats, 
  LeaderboardEntry, 
  Badge, 
  StoreItem,
  UserPurchase,
  GamificationEvent,
  GAMIFICATION_EVENTS
} from '../types/gamification';

export function useGamification() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserGamificationStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user stats
  const loadUserStats = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const userStats = await GamificationService.getUserStats(user.id);
      setStats(userStats);
    } catch (err) {
      setError('Failed to load user stats');
      console.error('Error loading user stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load leaderboard
  const loadLeaderboard = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const leaderboardData = await GamificationService.getLeaderboard(limit);
      setLeaderboard(leaderboardData);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load badges
  const loadBadges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const badgesData = await GamificationService.getBadges();
      setBadges(badgesData);
    } catch (err) {
      setError('Failed to load badges');
      console.error('Error loading badges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load store items
  const loadStoreItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storeData = await GamificationService.getStoreItems();
      setStoreItems(storeData);
    } catch (err) {
      setError('Failed to load store items');
      console.error('Error loading store items:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user purchases
  const loadUserPurchases = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const purchases = await GamificationService.getUserPurchases(user.id);
      setUserPurchases(purchases);
    } catch (err) {
      setError('Failed to load user purchases');
      console.error('Error loading user purchases:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Award points
  const awardPoints = useCallback(async (
    eventType: keyof typeof GAMIFICATION_EVENTS,
    description?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user?.id) return;

    try {
      await GamificationService.awardPoints(user.id, eventType, description, metadata);
      // Reload user stats after awarding points
      await loadUserStats();
    } catch (err) {
      setError('Failed to award points');
      console.error('Error awarding points:', err);
    }
  }, [user?.id, loadUserStats]);

  // Purchase item
  const purchaseItem = useCallback(async (itemId: string, quantity: number = 1) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      await GamificationService.purchaseItem(user.id, itemId, quantity);
      // Reload user stats and purchases after purchase
      await Promise.all([loadUserStats(), loadUserPurchases()]);
    } catch (err) {
      setError('Failed to purchase item');
      console.error('Error purchasing item:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadUserStats, loadUserPurchases]);

  // Trigger daily login
  const triggerDailyLogin = useCallback(async () => {
    if (!user?.id) return;

    try {
      await GamificationService.triggerDailyLogin(user.id);
      await loadUserStats();
    } catch (err) {
      console.error('Error triggering daily login:', err);
    }
  }, [user?.id, loadUserStats]);

  // Trigger course enrollment
  const triggerCourseEnrollment = useCallback(async (courseId: string) => {
    if (!user?.id) return;

    try {
      await GamificationService.triggerCourseEnrollment(user.id, courseId);
      await loadUserStats();
    } catch (err) {
      console.error('Error triggering course enrollment:', err);
    }
  }, [user?.id, loadUserStats]);

  // Trigger course completion
  const triggerCourseCompletion = useCallback(async (courseId: string) => {
    if (!user?.id) return;

    try {
      await GamificationService.triggerCourseCompletion(user.id, courseId);
      await loadUserStats();
    } catch (err) {
      console.error('Error triggering course completion:', err);
    }
  }, [user?.id, loadUserStats]);

  // Trigger profile completion
  const triggerProfileCompletion = useCallback(async () => {
    if (!user?.id) return;

    try {
      await GamificationService.triggerProfileCompletion(user.id);
      await loadUserStats();
    } catch (err) {
      console.error('Error triggering profile completion:', err);
    }
  }, [user?.id, loadUserStats]);

  // Trigger first course
  const triggerFirstCourse = useCallback(async () => {
    if (!user?.id) return;

    try {
      await GamificationService.triggerFirstCourse(user.id);
      await loadUserStats();
    } catch (err) {
      console.error('Error triggering first course:', err);
    }
  }, [user?.id, loadUserStats]);

  // Trigger perfect score
  const triggerPerfectScore = useCallback(async (assessmentId: string) => {
    if (!user?.id) return;

    try {
      await GamificationService.triggerPerfectScore(user.id, assessmentId);
      await loadUserStats();
    } catch (err) {
      console.error('Error triggering perfect score:', err);
    }
  }, [user?.id, loadUserStats]);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadUserStats();
      loadBadges();
      loadStoreItems();
      loadUserPurchases();
    }
  }, [user?.id, loadUserStats, loadBadges, loadStoreItems, loadUserPurchases]);

  // Auto-trigger daily login on component mount
  useEffect(() => {
    if (user?.id) {
      triggerDailyLogin();
    }
  }, [user?.id, triggerDailyLogin]);

  return {
    // State
    stats,
    leaderboard,
    badges,
    storeItems,
    userPurchases,
    loading,
    error,

    // Actions
    loadUserStats,
    loadLeaderboard,
    loadBadges,
    loadStoreItems,
    loadUserPurchases,
    awardPoints,
    purchaseItem,
    triggerDailyLogin,
    triggerCourseEnrollment,
    triggerCourseCompletion,
    triggerProfileCompletion,
    triggerFirstCourse,
    triggerPerfectScore,

    // Utility functions
    clearError: () => setError(null),
  };
} 