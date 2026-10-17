"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import * as authService from "@/services/auth/authService";
import * as userService from "@/services/userService";

export function useSettingsData() {
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
    if (e && e.preventDefault) e.preventDefault();
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

      // Si el usuario tiene id, sincronizar perfil con el backend
      if (currentUser?.id) {
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
    if (e && e.preventDefault) e.preventDefault();
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
      if (currentUser?.id) {
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
    if (e && e.preventDefault) e.preventDefault();
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
    if (e && e.preventDefault) e.preventDefault();
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

  return {
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
  };
}
