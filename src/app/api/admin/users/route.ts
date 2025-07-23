
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

// Rota protegida para administradores

// NOTA: É crucial proteger esta rota. O createClient aqui usa a service_role key
// que tem permissões de super administrador. NUNCA exponha esta chave no lado do cliente.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Função para verificar se o utilizador é um administrador
async function verifyAdmin(req: NextRequest): Promise<{ isAdmin: boolean; error?: NextResponse }> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return { isAdmin: false, error: NextResponse.json({ error: 'Autorização em falta.' }, { status: 401 }) };
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return { isAdmin: false, error: NextResponse.json({ error: 'Token malformado.' }, { status: 401 }) };
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
        return { isAdmin: false, error: NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 }) };
    }
    
    // Verifique se o utilizador tem o email de administrador
    if (user.email !== 'admin@scriptify.com') {
        return { isAdmin: false, error: NextResponse.json({ error: 'Acesso negado. Requer privilégios de administrador.' }, { status: 403 }) };
    }

    return { isAdmin: true };
}


export async function GET(req: NextRequest) {
    const { isAdmin, error } = await verifyAdmin(req);
    if (!isAdmin) {
        return error;
    }
    
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    return NextResponse.json(users.users);
}

export async function DELETE(req: NextRequest) {
    const { isAdmin, error } = await verifyAdmin(req);
    if (!isAdmin) {
        return error;
    }
    
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'O ID do utilizador é obrigatório.' }, { status: 400 });
    }
    
    // Proteção extra para não apagar o próprio admin
    const { data: { user } } = await supabaseAdmin.auth.getUser(req.headers.get('Authorization')?.split(' ')[1]);
    if (id === user?.id) {
         return NextResponse.json({ error: 'Não se pode apagar a si mesmo.' }, { status: 400 });
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Utilizador apagado com sucesso.' });
}
