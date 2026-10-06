"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Key,
  Trash2,
  Plus,
  Users,
  User,
  Edit,
  Phone,
  Mail,
  RefreshCw,
  UserCheck,
  UserX,
  X,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ModuleHeader from "@/components/layout/ModuleHeader";
import * as authService from "@/services/auth/authService";
import * as userService from "@/services/userService";

export default function SettingsView() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Profile form states
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UX Feedback states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // User Management states (Admin only)
  const [activeTab, setActiveTab] = useState("usuarios"); // "usuarios" | "perfil"
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "operario",
    telefono: "",
  });

  // Edit User Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    rol: "operario",
    telefono: "",
    activo: true,
    password: "",
  });

  const isAdmin =
    currentUser &&
    (currentUser.rol === "administrador" ||
      currentUser.role === "administrador" ||
      currentUser.role === "admin");

  // Función para recargar la lista de usuarios desde la API
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const data = await userService.getUsuarios();
      setUsersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      toast.error(err.message || "No se pudo cargar la lista de personal.");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setNombre(user.nombre || user.name?.split(" ")[0] || "");
      setApellido(
        user.apellido ||
          user.name?.split(" ").slice(1).join(" ") ||
          ""
      );
      setEmail(user.email || "");
      setTelefono(user.telefono || "");

      const isUserAdmin =
        user.rol === "administrador" ||
        user.role === "administrador" ||
        user.role === "admin";

      if (isUserAdmin) {
        setActiveTab("usuarios");
        fetchUsers();
      } else {
        setActiveTab("perfil");
      }
    }
    setIsLoadingAuth(false);
  }, [fetchUsers]);

  // Guardar perfil personal
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre es requerido.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const fullName = `${nombre.trim()} ${apellido.trim()}`.trim();
      const updatedData = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        name: fullName,
        telefono: telefono.trim(),
      };

      // Si el usuario tiene id y es administrador, actualizar vía backend
      if (currentUser?.id && isAdmin) {
        try {
          await userService.updateUsuario(currentUser.id, {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            telefono: telefono.trim() || null,
          });
        } catch (apiErr) {
          console.warn("No se pudo sincronizar perfil con backend:", apiErr);
        }
      }

      authService.updateCurrentUser(updatedData);
      setCurrentUser((prev) => ({ ...prev, ...updatedData }));

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
      toast.success("Perfil actualizado con éxito.");
    } catch (err) {
      toast.error(err.message || "Error al actualizar el perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Actualizar contraseña personal
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Complete todos los campos de contraseña.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setIsSavingPassword(true);
    try {
      if (currentUser?.id && isAdmin) {
        await userService.updateUsuario(currentUser.id, {
          password: newPassword,
        });
      }
      toast.success("Contraseña actualizada exitosamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.message || "Error al actualizar la contraseña.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Crear usuario
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (
      !newUserForm.nombre.trim() ||
      !newUserForm.apellido.trim() ||
      !newUserForm.email.trim() ||
      !newUserForm.password
    ) {
      toast.error("Por favor completa todos los campos requeridos.");
      return;
    }
    if (newUserForm.password.length < 6) {
      toast.error("La contraseña temporal debe tener al menos 6 caracteres.");
      return;
    }

    setIsCreating(true);
    try {
      await userService.createUsuario({
        nombre: newUserForm.nombre.trim(),
        apellido: newUserForm.apellido.trim(),
        email: newUserForm.email.trim().toLowerCase(),
        password: newUserForm.password,
        rol: newUserForm.rol,
        telefono: newUserForm.telefono.trim() || null,
      });

      toast.success("Usuario registrado exitosamente en el sistema.");
      setIsCreateModalOpen(false);
      setNewUserForm({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        rol: "operario",
        telefono: "",
      });
      await fetchUsers();
    } catch (err) {
      console.error("Error al crear usuario:", err);
      toast.error(err.message || "Error al registrar el nuevo usuario.");
    } finally {
      setIsCreating(false);
    }
  };

  // Abrir modal de edición
  const handleOpenEditModal = (u) => {
    setEditingUser(u);
    setEditUserForm({
      nombre: u.nombre || "",
      apellido: u.apellido || "",
      email: u.email || "",
      rol: u.rol || "operario",
      telefono: u.telefono || "",
      activo: u.activo ?? true,
      password: "",
    });
    setIsEditModalOpen(true);
  };

  // Guardar edición de usuario
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editUserForm.nombre.trim() || !editUserForm.apellido.trim()) {
      toast.error("El nombre y apellido son obligatorios.");
      return;
    }

    setIsEditing(true);
    try {
      const payload = {
        nombre: editUserForm.nombre.trim(),
        apellido: editUserForm.apellido.trim(),
        email: editUserForm.email.trim().toLowerCase(),
        rol: editUserForm.rol,
        telefono: editUserForm.telefono.trim() || null,
        activo: editUserForm.activo,
      };

      if (editUserForm.password && editUserForm.password.trim() !== "") {
        if (editUserForm.password.length < 6) {
          toast.error("La contraseña debe tener al menos 6 caracteres.");
          setIsEditing(false);
          return;
        }
        payload.password = editUserForm.password;
      }

      await userService.updateUsuario(editingUser.id, payload);
      toast.success("Usuario actualizado correctamente.");
      setIsEditModalOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      toast.error(err.message || "Error al actualizar los datos del usuario.");
    } finally {
      setIsEditing(false);
    }
  };

  // Inactivar / Soft Delete de usuario
  const handleDeleteUser = async (u) => {
    if (u.id === currentUser?.id || u.email === currentUser?.email) {
      toast.error("No puede desactivar su propio usuario administrador.");
      return;
    }

    const fullName = `${u.nombre} ${u.apellido}`.trim() || u.email;
    const confirmed = window.confirm(
      `¿Está seguro de desactivar a ${fullName}? El usuario perderá acceso al sistema.`
    );
    if (!confirmed) return;

    try {
      await userService.deleteUsuario(u.id);
      toast.success(`Usuario ${fullName} desactivado correctamente.`);
      await fetchUsers();
    } catch (err) {
      console.error("Error al desactivar usuario:", err);
      toast.error(err.message || "Error al desactivar el usuario.");
    }
  };

  // Renderizar Badge de Rol
  const renderRoleBadge = (rol) => {
    const roleKey = (rol || "").toLowerCase();
    if (roleKey === "administrador" || roleKey === "admin") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
          Administrador
        </span>
      );
    }
    if (roleKey === "veterinario") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          Veterinario
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        Operario
      </span>
    );
  };

  // Renderizar Badge de Estado
  const renderStatusBadge = (activo) => {
    if (activo) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <UserCheck size={13} className="text-emerald-600" />
          Activo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <UserX size={13} className="text-rose-600" />
        Inactivo
      </span>
    );
  };

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
        <Card className="rounded-[2.5rem]! p-8 bg-white border border-slate-100 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Users className="text-purple-600 w-6 h-6" />
                Personal y Usuarios del Sistema
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
                Directorio oficial sincronizado con base de datos PostgreSQL
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                tone="soft"
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="flex items-center gap-1.5 font-bold rounded-xl! py-3 px-4 text-xs"
                title="Actualizar lista de usuarios"
              >
                <RefreshCw
                  size={14}
                  className={loadingUsers ? "animate-spin text-emerald-600" : ""}
                />
                Recargar
              </Button>

              <Button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                tone="primary"
                className="flex items-center gap-1.5 font-bold rounded-xl! py-3 px-5 text-sm shadow-md"
              >
                <Plus size={16} />
                + Registrar Personal
              </Button>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-2">Nombre Completo</th>
                  <th className="px-6 py-2">Email</th>
                  <th className="px-6 py-2">Rol Asignado</th>
                  <th className="px-6 py-2">Teléfono</th>
                  <th className="px-6 py-2 text-center">Estado</th>
                  <th className="px-6 py-2 text-right pr-8">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers && usersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                        <span className="text-sm font-semibold text-slate-500">
                          Consultando personal en PostgreSQL...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400 font-semibold"
                    >
                      No se encontraron usuarios registrados en la base de datos.
                    </td>
                  </tr>
                ) : (
                  usersList.map((usr) => {
                    const fullName = `${usr.nombre || ""} ${usr.apellido || ""}`.trim();
                    const isSelf =
                      usr.id === currentUser?.id || usr.email === currentUser?.email;

                    return (
                      <tr
                        key={usr.id}
                        className="bg-white hover:bg-slate-50/80 transition-all shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] border border-slate-100 rounded-2xl"
                      >
                        {/* Nombre Completo */}
                        <td className="px-6 py-4 rounded-l-2xl font-black text-slate-900 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-xs uppercase">
                              {usr.nombre?.[0] || "U"}
                              {usr.apellido?.[0] || ""}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {fullName || "Sin nombre registrado"}
                              </div>
                              {isSelf && (
                                <span className="text-[10px] text-purple-600 font-black tracking-wider uppercase">
                                  (Tu cuenta activa)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 font-semibold text-slate-600 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Mail size={14} className="text-slate-400 shrink-0" />
                            <span>{usr.email}</span>
                          </div>
                        </td>

                        {/* Rol */}
                        <td className="px-6 py-4">
                          {renderRoleBadge(usr.rol)}
                        </td>

                        {/* Teléfono */}
                        <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                          {usr.telefono ? (
                            <div className="flex items-center gap-1.5">
                              <Phone size={13} className="text-slate-400 shrink-0" />
                              <span>{usr.telefono}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-normal italic">
                              N/R
                            </span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4 text-center">
                          {renderStatusBadge(usr.activo)}
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 rounded-r-2xl text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(usr)}
                              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                              title="Editar usuario"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(usr)}
                              disabled={isSelf}
                              className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title={
                                isSelf
                                  ? "No puede eliminar su propio usuario administrador"
                                  : "Desactivar usuario"
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SECCIÓN 2: PERFIL Y SEGURIDAD (ACCESIBLE PARA TODOS) */}
      {(activeTab === "perfil" || !isAdmin) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de Perfil */}
          <Card
            as="form"
            onSubmit={handleSaveProfile}
            className="p-8 bg-white border border-slate-100 shadow-sm rounded-4xl flex flex-col gap-6 justify-between"
          >
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-100">
                <Shield className="text-emerald-500 w-6 h-6" /> Información de Perfil
              </h3>

              {/* Rol actual */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Rol asignado en el sistema
                </span>
                <div className="inline-flex">
                  {renderRoleBadge(currentUser.rol || currentUser.role)}
                </div>
              </div>

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre..."
                  required
                />
                <Input
                  label="Apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Tu apellido..."
                />
              </div>

              {/* Teléfono */}
              <Input
                label="Teléfono de Contacto"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+57 300 1234567"
              />

              {/* Correo Institucional */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Correo Institucional
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-semibold cursor-not-allowed outline-none text-sm"
                />
                <span className="text-[10px] text-slate-400 font-bold block">
                  El correo institucional está vinculado a tus credenciales y no puede modificarse libremente.
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                tone="primary"
                isLoading={isSavingProfile}
                className="w-full py-4 font-black rounded-xl!"
              >
                Guardar Cambios de Perfil
              </Button>
            </div>
          </Card>

          {/* Formulario de Cambio de Contraseña */}
          <Card
            as="form"
            onSubmit={handleUpdatePassword}
            className="p-8 bg-white border border-slate-100 shadow-sm rounded-4xl flex flex-col gap-6 justify-between"
          >
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 border-b pb-3 border-slate-100">
                <Key className="text-indigo-500 w-6 h-6" /> Seguridad y Credenciales
              </h3>

              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs font-semibold text-indigo-900 flex items-start gap-3">
                <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  Asegúrate de utilizar una contraseña robusta con al menos 6 caracteres que combine letras y números.
                </p>
              </div>

              {/* Contraseña Actual */}
              <Input
                label="Contraseña Actual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              {/* Nueva Contraseña */}
              <Input
                label="Nueva Contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />

              {/* Confirmar Nueva Contraseña */}
              <Input
                label="Confirmar Nueva Contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                required
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                tone="secondary"
                isLoading={isSavingPassword}
                className="w-full py-4 font-black rounded-xl!"
              >
                Actualizar Contraseña
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: REGISTRAR PERSONAL (ADMIN ONLY) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card
            as="form"
            onSubmit={handleCreateUserSubmit}
            className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white my-8"
          >
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-black mb-2 text-slate-900 flex items-center gap-2">
              <Plus className="text-emerald-500 w-7 h-7" />
              Registrar Personal
            </h2>
            <p className="text-xs text-slate-400 font-bold mb-6 uppercase tracking-wider">
              Crea una nueva cuenta técnica con acceso al sistema
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Ej: Laura"
                  value={newUserForm.nombre}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, nombre: e.target.value })
                  }
                  required
                />
                <Input
                  label="Apellido"
                  placeholder="Ej: Sánchez"
                  value={newUserForm.apellido}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, apellido: e.target.value })
                  }
                  required
                />
              </div>

              <Input
                label="Correo Institucional"
                type="email"
                placeholder="ejemplo@sigep.com"
                value={newUserForm.email}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, email: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Rol en Granja
                  </label>
                  <select
                    value={newUserForm.rol}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, rol: e.target.value })
                    }
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-bold text-slate-700 text-sm cursor-pointer"
                  >
                    <option value="administrador">Administrador</option>
                    <option value="veterinario">Veterinario</option>
                    <option value="operario">Operario</option>
                  </select>
                </div>

                <Input
                  label="Teléfono (Opcional)"
                  placeholder="+57 310..."
                  value={newUserForm.telefono}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, telefono: e.target.value })
                  }
                />
              </div>

              <Input
                label="Contraseña Temporal"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newUserForm.password}
                onChange={(e) =>
                  setNewUserForm({ ...newUserForm, password: e.target.value })
                }
                required
              />
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 font-bold rounded-xl!"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                tone="primary"
                isLoading={isCreating}
                className="flex-1 font-black rounded-xl!"
              >
                Registrar Usuario
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: EDITAR USUARIO (ADMIN ONLY) */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card
            as="form"
            onSubmit={handleEditUserSubmit}
            className="w-full max-w-lg p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white my-8"
          >
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingUser(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-2xl font-black mb-2 text-slate-900 flex items-center gap-2">
              <Edit className="text-indigo-500 w-6 h-6" />
              Editar Usuario
            </h2>
            <p className="text-xs text-slate-400 font-bold mb-6 uppercase tracking-wider">
              Modifica la información y estado de la cuenta
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  value={editUserForm.nombre}
                  onChange={(e) =>
                    setEditUserForm({ ...editUserForm, nombre: e.target.value })
                  }
                  required
                />
                <Input
                  label="Apellido"
                  value={editUserForm.apellido}
                  onChange={(e) =>
                    setEditUserForm({ ...editUserForm, apellido: e.target.value })
                  }
                  required
                />
              </div>

              <Input
                label="Correo Electrónico"
                type="email"
                value={editUserForm.email}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, email: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Rol
                  </label>
                  <select
                    value={editUserForm.rol}
                    onChange={(e) =>
                      setEditUserForm({ ...editUserForm, rol: e.target.value })
                    }
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-bold text-slate-700 text-sm cursor-pointer"
                  >
                    <option value="administrador">Administrador</option>
                    <option value="veterinario">Veterinario</option>
                    <option value="operario">Operario</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">
                    Estado de la Cuenta
                  </label>
                  <select
                    value={editUserForm.activo ? "true" : "false"}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        activo: e.target.value === "true",
                      })
                    }
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-bold text-slate-700 text-sm cursor-pointer"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <Input
                label="Teléfono"
                placeholder="+57 310..."
                value={editUserForm.telefono}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, telefono: e.target.value })
                }
              />

              <Input
                label="Nueva Contraseña (Opcional)"
                type="password"
                placeholder="Dejar en blanco para conservar la actual"
                value={editUserForm.password}
                onChange={(e) =>
                  setEditUserForm({ ...editUserForm, password: e.target.value })
                }
              />
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
                className="flex-1 font-bold rounded-xl!"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                tone="primary"
                isLoading={isEditing}
                className="flex-1 font-black rounded-xl!"
              >
                Actualizar Cambios
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
