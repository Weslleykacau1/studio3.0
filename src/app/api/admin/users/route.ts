
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Simple in-memory check for admin privileges.
// In a real app, this should be a proper session check.
const checkAdminAuth = (req: NextRequest) => {
    // This is a placeholder. A real implementation would involve checking
    // a secure session or token to verify admin privileges.
    return true; 
};

// GET /api/admin/users - Fetches all users
export async function GET(req: NextRequest) {
    if (!checkAdminAuth(req)) {
        return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
    }

    try {
        const userList = await db.select({
            id: users.id,
            email: users.email,
            created_at: users.createdAt,
        }).from(users).orderBy(users.createdAt);

        return NextResponse.json(userList);
    } catch (error) {
        console.error('Erro ao carregar utilizadores:', error);
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
    }
}

// DELETE /api/admin/users - Deletes a user by ID
const deleteUserSchema = z.object({
  id: z.string(),
});

export async function DELETE(req: NextRequest) {
    if (!checkAdminAuth(req)) {
        return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const parsed = deleteUserSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'ID de utilizador inválido.' }, { status: 400 });
        }
        
        const { id } = parsed.data;

        // Hardcoded check to prevent deletion of the main admin user
        const userToDelete = await db.query.users.findFirst({ where: eq(users.id, id) });
        if (userToDelete?.email === 'weslley.kacau@gmail.com') {
            return NextResponse.json({ error: 'Este utilizador administrador não pode ser apagado.' }, { status: 403 });
        }
        
        await db.delete(users).where(eq(users.id, id));

        return NextResponse.json({ message: 'Utilizador apagado com sucesso.' });
    } catch (error) {
        console.error('Erro ao apagar utilizador:', error);
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
    }
}
