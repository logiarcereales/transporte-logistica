import LoadRequestForm from './LoadRequestForm';

export default async function LoadRequestPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { telefono } = await searchParams;
    const phone = typeof telefono === 'string' ? telefono : undefined;

    return (
        <LoadRequestForm initialPhone={phone} />
    );
}
