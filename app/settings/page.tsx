'use client';

import { useSession } from 'next-auth/react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Account Information</CardTitle>
              </div>
              <CardDescription>
                Your account details from Google OAuth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>Display Name</Label>
                  <Input value={session?.user?.name || ''} disabled />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={session?.user?.email || ''} disabled />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Account information is managed through your Google account and cannot be changed here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
