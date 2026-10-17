"use client";

import React from "react";
import { Users, User, RefreshCw } from "lucide-react";
import Card from "@/components/ui/Card";
import ModuleHeader from "@/components/layout/ModuleHeader";

import { useSettingsData } from "./hooks/useSettingsData";
import UserListTab from "./components/settings/UserListTab";
import ProfileSecurityTab from "./components/settings/ProfileSecurityTab";
import CreateUserModal from "./components/settings/CreateUserModal";
import EditUserModal from "./components/settings/EditUserModal";

export default function SettingsView() {
  const {
    currentUser,
    isLoadingAuth,
    isAdmin,
    // Profile
    nombre,
    setNombre,
    apellido,
    setApellido,
    email,
    telefono,
    setTelefono,
    isSavingProfile,
    handleSaveProfile,
    // Password
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSavingPassword,
    handleUpdatePassword,
    // Tabs & Users
    activeTab,
    setActiveTab,
    usersList,
    loadingUsers,
    fetchUsers,
    // Create Modal
    isCreateModalOpen,
    setIsCreateModalOpen,
    isCreating,
    newUserForm,
    setNewUserForm,
    handleCreateUserSubmit,
    // Edit Modal
    isEditModalOpen,
    setIsEditModalOpen,
    isEditing,
    editingUser,
    editUserForm,
    setEditUserForm,
    handleOpenEditModal,
    handleEditUserSubmit,
    // Delete
    handleDeleteUser,
  } = useSettingsData();

  if (isLoadingAuth || !currentUser) {
    return (
      <div className="w-full flex flex-col gap-6">
        <ModuleHeader
          category="SISTEMA"
          title="Configuración y Personal"
          description="Gestión integral de credenciales, roles y accesos técnicos de PorciTech."
        />
        <Card className="p-12 text-center bg-white border border-slate-100 shadow-sm rounded-4xl flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-500 font-semibold text-sm">
            Cargando información del usuario...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="SISTEMA"
        title={isAdmin ? "Gestión de Personal y Seguridad" : "Perfil y Seguridad"}
        description={
          isAdmin
            ? "Administra los usuarios del plantel porcino, asigna roles y gestiona tus credenciales."
            : "Gestiona tu información personal y credenciales de acceso al sistema."
        }
      />

      {/* Tabs Selector exclusivo para Administrador */}
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl shadow-xs border border-slate-200/80 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("usuarios")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "usuarios"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            Gestión de Personal / Usuarios
            <span
              className={`ml-1.5 px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === "usuarios"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {usersList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("perfil")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "perfil"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4" />
            Mi Cuenta y Seguridad
          </button>
        </div>
      )}

      {/* SECCIÓN 1: GESTIÓN DE USUARIOS (SOLO ADMINISTRADOR) */}
      {isAdmin && activeTab === "usuarios" && (
        <UserListTab
          usersList={usersList}
          loadingUsers={loadingUsers}
          currentUser={currentUser}
          fetchUsers={fetchUsers}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenEditModal={handleOpenEditModal}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {/* SECCIÓN 2: PERFIL Y SEGURIDAD (ACCESIBLE PARA TODOS) */}
      {(activeTab === "perfil" || !isAdmin) && (
        <ProfileSecurityTab
          currentUser={currentUser}
          nombre={nombre}
          setNombre={setNombre}
          apellido={apellido}
          setApellido={setApellido}
          email={email}
          telefono={telefono}
          setTelefono={setTelefono}
          isSavingProfile={isSavingProfile}
          onSaveProfile={handleSaveProfile}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          isSavingPassword={isSavingPassword}
          onUpdatePassword={handleUpdatePassword}
        />
      )}

      {/* MODAL: REGISTRAR PERSONAL (ADMIN ONLY) */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        newUserForm={newUserForm}
        setNewUserForm={setNewUserForm}
        isCreating={isCreating}
        onSubmit={handleCreateUserSubmit}
      />

      {/* MODAL: EDITAR USUARIO (ADMIN ONLY) */}
      <EditUserModal
        isOpen={isEditModalOpen}
        editingUser={editingUser}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        editUserForm={editUserForm}
        setEditUserForm={setEditUserForm}
        isEditing={isEditing}
        onSubmit={handleEditUserSubmit}
      />
    </div>
  );
}
