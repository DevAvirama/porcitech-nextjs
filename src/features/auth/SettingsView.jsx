"use client";

import React, { useState, useEffect } from "react";
import { Shield, Key, CheckCircle, AlertTriangle, Trash2, Plus, Users, User } from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ModuleHeader from "@/components/layout/ModuleHeader";
import * as authService from "@/services/auth/authService";

export default function SettingsView() {
  const [user, setUser] = useState(null);

  // Profile form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UX Feedback states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // User Management states (Admin only)
  const [activeTab, setActiveTab] = useState("perfil"); // "perfil" | "usuarios"
  const [usersList, setUsersList] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    role: "operativo",
    password: ""
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
    }
    const list = authService.getUsers();
    setUsersList(list);
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre completo no puede estar vacío.");
      return;
    }

    setIsSavingProfile(true);
    // Simular un delay para simular comunicación de red/procesamiento
    setTimeout(() => {
      try {
        const updated = authService.updateCurrentUser({ name });
        if (updated) {
          setUser(updated);
          // Actualizar el header del sidebar si es posible forzando renderizado
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("storage"));
          }
          toast.success("Perfil actualizado con éxito");
        } else {
          toast.error("No se pudo actualizar el perfil.");
        }
      } catch (err) {
        toast.error("Error inesperado al guardar el perfil.");
      } finally {
        setIsSavingProfile(false);
      }
    }, 800);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Todos los campos de contraseña son requeridos.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    setIsSavingPassword(true);
    // Simular delay de guardado
    setTimeout(() => {
      toast.success("Contraseña actualizada exitosamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsSavingPassword(false);
    }, 1000);
  };

  // User list actions (Admin only)
  const handleChangeRole = (id, newRole) => {
    const updated = authService.updateUser(id, { role: newRole });
    if (updated) {
      setUsersList(authService.getUsers());
      toast.success("Rol de usuario actualizado con éxito");
    }
  };

  const handleDeleteUser = (id) => {
    const targetUser = usersList.find(u => u.id === id);
    if (targetUser && targetUser.email === user.email) {
      toast.error("No puedes eliminar tu propio usuario administrador.");
      return;
    }
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      authService.deleteUser(id);
      setUsersList(authService.getUsers());
      toast.success("Usuario eliminado correctamente");
    }
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      toast.error("Todos los campos son requeridos");
      return;
    }
    if (newUserForm.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    
    // Validar correo duplicado
    const exists = usersList.some(u => u.email.toLowerCase() === newUserForm.email.toLowerCase());
    if (exists) {
      toast.error("Ya existe un usuario con este correo electrónico");
      return;
    }

    authService.createUser(newUserForm);
    setUsersList(authService.getUsers());
    setIsUserModalOpen(false);
    setNewUserForm({
      name: "",
      email: "",
      role: "operativo",
      password: ""
    });
    toast.success("Usuario registrado con éxito");
  };

  const isAdmin = user && (user.role === "administrador" || user.role === "admin");

  if (!user) {
    return (
      <div className="w-full flex flex-col gap-6">
        <ModuleHeader
          category="CONFIGURACIÓN DE USUARIO"
          title="Perfil y Seguridad"
          description="Gestiona tu información personal, rol y credenciales de acceso al sistema."
        />
        <Card className="p-8 text-center bg-white border border-slate-100 shadow-sm rounded-4xl">
          <p className="text-slate-500 font-medium">Cargando información del usuario...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Cabecera Estandarizada */}
      <ModuleHeader
        category="CONFIGURACIÓN DE USUARIO"
        title="Perfil y Seguridad"
        description="Gestiona tu información personal, rol y credenciales de acceso al sistema."
      />

      {/* Tabs selector para Administrador */}
      {isAdmin && (
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-fit">
          <button
            onClick={() => setActiveTab("perfil")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "perfil"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <User className="inline-block w-4 h-4 mr-1.5 mb-0.5" />
            Mi Cuenta
          </button>
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "usuarios"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            <Users className="inline-block w-4 h-4 mr-1.5 mb-0.5" />
            Gestión de Usuarios
          </button>
        </div>
      )}

      {/* Vista de Perfil */}
      {activeTab === "perfil" && (
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
                  Rol asignado
                </span>
                <div className="inline-flex">
                  <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Nombre Completo */}
              <Input
                label="Nombre Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu nombre..."
                required
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
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-semibold cursor-not-allowed outline-none"
                />
                <span className="text-[10px] text-slate-400 font-bold block">
                  El correo institucional no puede modificarse por seguridad informática.
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
                Guardar Cambios
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
                placeholder="Confirmación de contraseña"
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

      {/* Vista de Gestión de Usuarios (Admin only) */}
      {isAdmin && activeTab === "usuarios" && (
        <Card className="rounded-[2.5rem]! p-8 bg-white border border-slate-100 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Users className="text-indigo-500 w-6 h-6" />
                Gestión de Usuarios del Sistema
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
                Administra los accesos y roles del equipo técnico.
              </p>
            </div>
            <Button
              onClick={() => setIsUserModalOpen(true)}
              tone="primary"
              className="flex items-center gap-1.5 font-bold rounded-xl! py-3 px-5 text-sm"
            >
              <Plus size={16} />
              Agregar Usuario
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8">Nombre</th>
                  <th className="px-6">Correo</th>
                  <th className="px-6">Rol</th>
                  <th className="px-6 text-center">Estado</th>
                  <th className="px-6 text-right pr-10">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr) => (
                  <tr
                    key={usr.id}
                    className="bg-white hover:bg-slate-50 transition-all shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100"
                  >
                    <td className="px-8 py-5 rounded-l-2xl font-black text-slate-900">
                      {usr.name}
                    </td>
                    <td className="px-6 py-5 font-semibold text-slate-600 text-sm">
                      {usr.email}
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={usr.role}
                        onChange={(e) => handleChangeRole(usr.id, e.target.value)}
                        className="p-2.5 border border-slate-200 rounded-xl bg-slate-55 bg-slate-50 text-slate-800 font-bold cursor-pointer outline-none text-xs font-bold"
                      >
                        <option value="administrador">Administrador</option>
                        <option value="veterinario">Veterinario</option>
                        <option value="operativo">Operario</option>
                      </select>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest text-white bg-sena-green uppercase">
                        {usr.estado}
                      </span>
                    </td>
                    <td className="px-8 py-5 rounded-r-2xl text-right">
                      <button
                        onClick={() => handleDeleteUser(usr.id)}
                        disabled={usr.email === user.email}
                        className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={usr.email === user.email ? "No puedes eliminarte a ti mismo" : "Eliminar usuario"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Agregar Usuario */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-900">
          <Card
            as="form"
            onSubmit={handleAddUserSubmit}
            className="w-full max-w-md p-8! rounded-[2.5rem]! shadow-2xl relative border border-slate-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 font-bold bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900 flex items-center gap-2">
              <Plus className="text-emerald-500 w-6 h-6" />
              Agregar Nuevo Usuario
            </h2>

            <div className="space-y-4">
              <Input
                label="Nombre Completo"
                placeholder="Nombre del usuario"
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                required
              />
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="usuario@sigep.com"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                required
              />
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Rol</label>
                <div className="relative">
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                  >
                    <option value="administrador">Administrador</option>
                    <option value="veterinario">Veterinario</option>
                    <option value="operativo">Operario</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>
              <Input
                label="Contraseña"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                tone="soft"
                onClick={() => setIsUserModalOpen(false)}
                className="flex-1 font-bold rounded-xl!"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                tone="primary"
                className="flex-1 font-black rounded-xl!"
              >
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
