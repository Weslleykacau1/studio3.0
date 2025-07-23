import type {NextConfig} from 'next';
import webpack from 'webpack';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Adicionado para corrigir o erro 'require.extensions' do handlebars
    if (isServer) {
        config.externals.push('handlebars');
    }
    
    // Garante que as variáveis de ambiente do Supabase estão disponíveis no cliente
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL),
        'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      })
    );

    return config;
  },
};

export default nextConfig;
