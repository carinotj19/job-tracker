import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/Test.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/applications',
      name: 'applications',
      component: () => import('../views/applications/ApplicationList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/applications/new',
      name: 'new-application',
      component: () => import('../views/applications/ApplicationForm.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/applications/:id',
      name: 'application-details',
      component: () => import('../views/applications/ApplicationDetails.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/applications/:id/edit',
      name: 'edit-application',
      component: () => import('../views/applications/ApplicationForm.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/companies',
      name: 'companies',
      component: () => import('../views/companies/CompanyList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/contacts',
      name: 'contacts',
      component: () => import('../views/contacts/ContactList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/insights',
      name: 'insights',
      component: () => import('../views/Insights.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach(async (to) => {
  const { data: { session } } = await supabase.auth.getSession()
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && !session) {
    return { name: 'login' }
  }

  if (to.path === '/login' && session) {
    return { name: 'dashboard' }
  }
  
  return true
})

export default router 