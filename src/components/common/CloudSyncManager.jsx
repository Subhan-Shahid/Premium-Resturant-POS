import { useEffect, useRef } from 'react'
import useStore from '../../store/useStore'
import { 
  subscribeToCloudSync, 
  saveCategoryToCloud, 
  SYNC_CATEGORIES,
  getFirebaseConfig 
} from '../../services/firebase'

export default function CloudSyncManager() {
  // Pure local storage mode requested
  return null
}
