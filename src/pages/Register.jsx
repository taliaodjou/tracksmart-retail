import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "@/components/ui/use-toast";
import { COUNTRIES } from "@/lib/countries";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanCountry = country.trim();
    if (!cleanFirstName) {
      setError("Veuillez renseigner votre prénom");
      return;
    }
    if (!cleanLastName) {
      setError("Veuillez renseigner votre nom");
      return;
    }
    if (!cleanCountry) {
      setError("Veuillez renseigner votre pays");
      return;
    }
    if (!normalizedEmail) {
      setError("Veuillez renseigner votre email");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email: normalizedEmail, password });
      setEmail(normalizedEmail);
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: email.trim().toLowerCase(), otpCode });
      if (!result?.access_token) {
        throw new Error("Code de vérification invalide");
      }
      base44.auth.setToken(result.access_token);
      await base44.auth.updateMe({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        contact_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        country: country.trim(),
      });
      window.location.href = "/welcome";
    } catch (err) {
      setError(err.message || "Code de vérification invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email.trim().toLowerCase());
      toast({
        title: "Code envoyé",
        description: "Vérifiez votre email pour le nouveau code.",
      });
    } catch (err) {
      setError(err.message || "Échec de l'envoi du code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/welcome");
  };

  const handleMicrosoft = () => {
    base44.auth.loginWithProvider("microsoft", "/welcome");
  };

  const handleApple = () => {
    base44.auth.loginWithProvider("apple", "/welcome");
  };

  if (showOtp) {
    return (
      <AuthLayout
        title="Vérifiez votre email"
        subtitle={`Nous avons envoyé un code à ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? "Vérification..." : "Vérifier"}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Vous n'avez pas reçu le code ?{" "}
          <button type="button" onClick={handleResend} disabled={loading} className="text-primary font-medium hover:underline disabled:opacity-50">
            Renvoyer
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Créez votre compte"
      subtitle="Inscrivez-vous pour commencer"
      wide
      hideIcon
      footer={
        <>
          Déjà un compte ?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 text-sm font-medium"
          onClick={handleGoogle}
        >
          Continuer avec Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 text-sm font-medium"
          onClick={handleMicrosoft}
        >
          Continuer avec Microsoft
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 text-sm font-medium"
          onClick={handleApple}
        >
          Continuer avec Apple
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">ou</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            type="text"
            autoComplete="given-name"
            autoFocus
            placeholder="Votre prénom"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-12"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            type="text"
            autoComplete="family-name"
            placeholder="Votre nom"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-12"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmail((value) => value.trim().toLowerCase())}
            className="h-12"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            list="country-options"
            type="text"
            autoComplete="country-name"
            placeholder="Tapez les 2 premières lettres"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-12"
            required
          />
          <datalist id="country-options">
            {COUNTRIES.map((countryName) => (
              <option key={countryName} value={countryName} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
            minLength={8}
            required
          />
          <p className="text-xs text-muted-foreground">Minimum 8 caractères.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmer le mot de passe</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12"
            minLength={8}
            required
          />
        </div>
        <Button type="submit" className="w-full h-12 font-medium md:col-span-2" disabled={loading}>
          {loading ? "Création du compte..." : "Créer un compte"}
        </Button>
      </form>
    </AuthLayout>
  );
}