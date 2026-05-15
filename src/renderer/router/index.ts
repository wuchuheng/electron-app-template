import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/renderer/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/renderer/pages/Home.vue') },
      { path: 'about', component: () => import('@/renderer/pages/About.vue') },
    ],
  },
  {
    path: '/update-dialog',
    component: () => import('@/renderer/pages/UpdateDialog.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
