# Configuration des permissions de stockage Supabase

Ce document explique comment résoudre l'erreur : `new row violates row-level security policy` lors du téléchargement d'images dans un bucket Supabase.

## Problème

Par défaut, Supabase active la Row Level Security (RLS) sur toutes les tables, y compris les buckets de stockage. Si les politiques appropriées ne sont pas configurées, vous obtiendrez cette erreur lors des téléchargements de fichiers.

## Solution 1 : Configurer les politiques RLS (Recommandé)

1. **Connectez-vous à votre dashboard Supabase**
2. **Naviguez vers "Storage" → "Policies"**
3. **Sélectionnez le bucket "account-picture"**
4. **Ajoutez les politiques suivantes :**

### Politique 1 : Lecture publique

- **Nom** : Give public read access
- **Opération autorisée** : SELECT
- **Rôles ciblés** : Public (anonymous + authenticated)
- **Définition de politique USING** : `bucket_id = 'account-picture'`

### Politique 2 : Téléchargement pour utilisateurs authentifiés

- **Nom** : Allow authenticated users to upload
- **Opération autorisée** : INSERT
- **Rôles ciblés** : authenticated
- **Définition de politique USING** : `bucket_id = 'account-picture'`

### Politique 3 : Mise à jour pour propriétaires

- **Nom** : Allow update for owners
- **Opération autorisée** : UPDATE
- **Rôles ciblés** : authenticated
- **Définition de politique USING** : `bucket_id = 'account-picture' AND auth.uid() = owner`

## Solution 2 : Utiliser l'Éditeur SQL

Vous pouvez également définir ces politiques avec SQL. Dans l'éditeur SQL de Supabase, exécutez :

```sql
-- Activer l'accès en lecture pour tous les utilisateurs
CREATE POLICY "Give public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'account-picture');

-- Autoriser les téléchargements pour utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'account-picture');

-- Autoriser les mises à jour pour propriétaires
CREATE POLICY "Allow update for owners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'account-picture' AND auth.uid() = owner);
```

## Solution 3 : Désactiver RLS (Non recommandé pour production)

Pour les tests uniquement, vous pouvez désactiver temporairement RLS :

1. **Dans l'éditeur SQL, exécutez :**

   ```sql
   ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
   ```

2. **Réactivez-le plus tard pour la sécurité :**
   ```sql
   ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
   ```

## Vérifier l'état des politiques

Pour vérifier les politiques actuelles :

```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

## Notes supplémentaires

- Si vous utilisez un bucket personnalisé, remplacez 'account-picture' par le nom de votre bucket.
- Pour le déploiement en production, utilisez toujours la solution 1 ou 2 pour maintenir la sécurité.
