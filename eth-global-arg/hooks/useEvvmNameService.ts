
import { useReadContract, useSignMessage, useWriteContract, usePublicClient } from "wagmi";
import { keccak256, toHex } from "viem";
import { readContract } from "viem/actions";
import { evvmAbi } from "../constants/evvmAbi";
import { useState } from "react";

const nameServiceAddress = "0xYourNameServiceContractAddress"; // Replace with actual address

// 1. Check availability (read-only RPC)
export const useIsUsernameAvailable = (username: string) => {
    const { data: isAvailable, isLoading, isError } = useReadContract({
        address: nameServiceAddress,
        abi: evvmAbi,
        functionName: "isUsernameAvailable",
        args: [username],
    });

    return { isAvailable, isLoading, isError };
};

export const useGetPriceOfRegistration = (username: string) => {
    const { data: price, isLoading, isError } = useReadContract({
        address: nameServiceAddress,
        abi: evvmAbi,
        functionName: "getPriceOfRegistration",
        args: [username],
    });

    return { price, isLoading, isError };
};

// 2. Get a nonce for this user
export const useFindAvailableNonce = (userAddress: `0x${string}`) => {
    const [nonce, setNonce] = useState<bigint | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const publicClient = usePublicClient();

    const findNonce = async () => {
        if (!publicClient) {
            setIsError(true);
            return;
        }

        setIsLoading(true);
        setIsError(false);
        let currentNonce = BigInt(0);
        try {
            while (true) {
                const isAvailable = await readContract(publicClient, {
                    address: nameServiceAddress,
                    abi: evvmAbi,
                    functionName: "checkIfNameServiceNonceIsAvailable",
                    args: [userAddress, currentNonce],
                });

                if (isAvailable) {
                    setNonce(currentNonce);
                    break;
                }
                currentNonce++;
            }
        } catch (e) {
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return { nonce, findNonce, isLoading, isError };
};


// 3. Build signatures in the frontend
export const useNameServiceSignatureBuilder = () => {
    const { signMessageAsync } = useSignMessage();

    const signPreRegistration = async (username: string, nonce: bigint) => {
        // Generate random salt using crypto API
        const saltArray = new Uint8Array(32);
        crypto.getRandomValues(saltArray);
        const saltHex = toHex(saltArray);
        const hashUsername = keccak256(new TextEncoder().encode(username + saltHex));
        const message = `signPreRegistrationUsername(${hashUsername}, ${nonce})`;
        const signature_pre = await signMessageAsync({ message });
        return { hashUsername, signature_pre };
    };

    const signRegistration = async (username: string, clowNumber: bigint, nonce: bigint) => {
        const message = `signRegistrationUsername(${username}, ${clowNumber}, ${nonce})`;
        const signature_reg = await signMessageAsync({ message });
        return signature_reg;
    };

    return { signPreRegistration, signRegistration };
};

// 4. Execute the two Name Service txs
export const usePreRegisterUsername = () => {
    const { writeContract, isPending, isSuccess, isError } = useWriteContract();

    const execute = async (user: `0x${string}`, hashUsername: `0x${string}`, nameServiceNonce: bigint, signature_pre: `0x${string}`, payment: bigint) => {
        writeContract({
            address: nameServiceAddress,
            abi: evvmAbi,
            functionName: "preRegistrationUsername",
            args: [user, hashUsername, nameServiceNonce, signature_pre],
            value: payment
        });
    };
    return { execute, isPending, isSuccess, isError };
};

export const useRegisterUsername = () => {
    const { writeContract, isPending, isSuccess, isError } = useWriteContract();

    const execute = (user: `0x${string}`, username: string, clowNumber: bigint, nameServiceNonce: bigint, signature_reg: `0x${string}`) => {
        writeContract({
            address: nameServiceAddress,
            abi: evvmAbi,
            functionName: "registrationUsername",
            args: [user, username, clowNumber, nameServiceNonce, signature_reg],
        });
    };

    return { execute, isPending, isSuccess, isError };
};


// Post-registration checks
export const useGetOwnerOfIdentity = (username: string) => {
    const { data: owner, isLoading, isError } = useReadContract({
        address: nameServiceAddress,
        abi: evvmAbi,
        functionName: "getOwnerOfIdentity",
        args: [username],
    });

    return { owner, isLoading, isError };
};

export const useVerifyIfIdentityExists = (username: string) => {
    const { data: exists, isLoading, isError } = useReadContract({
        address: nameServiceAddress,
        abi: evvmAbi,
        functionName: "verifyIfIdentityExists",
        args: [username],
    });

    return { exists, isLoading, isError };
};
