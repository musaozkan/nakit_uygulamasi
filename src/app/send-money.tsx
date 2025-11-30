import Header from '@/components/header';
import { colors } from '@/constants/colors';
import { useWallet } from '@/providers/KeseWalletProvider';
import { useRouter } from 'expo-router';
import { Check, Send } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { CONTRACT_ADDRESSES } from '@/providers/wallet/constants';

export default function SendMoneyScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { wallet, account, balances, refreshWalletBalance } = useWallet();

    const [recipientAddress, setRecipientAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<'USDT' | 'XAUT'>('XAUT');
    const [isSending, setIsSending] = useState(false);

    // Load balances when screen opens
    useEffect(() => {
        if (wallet && !balances.isLoading && balances.list.length === 0) {
            refreshWalletBalance();
        }
    }, [wallet]);

    // Get balance for selected asset
    const getBalance = () => {
        const balanceItem = balances.list.find(b => b.symbol === selectedAsset);

        if (!balanceItem) return { balance: 0, formatted: '0.00' };

        const balanceInWei = BigInt(balanceItem.balance);
        const decimals = balanceItem.decimals || 18;
        const divisor = BigInt(10 ** decimals);
        const balanceInEth = Number(balanceInWei) / Number(divisor);

        return {
            balance: balanceInEth,
            formatted: balanceInEth.toFixed(4)
        };
    };

    const handleSend = async () => {
        if (!recipientAddress || !amount) {
            toast.error('Lütfen alıcı adresi ve tutarı girin');
            return;
        }

        if (!wallet || !account) {
            toast.error('Cüzdan bulunamadı');
            return;
        }

        const numericAmount = parseFloat(amount);
        if (numericAmount <= 0) {
            toast.error('Geçerli bir tutar girin');
            return;
        }

        const currentBalance = getBalance();
        if (numericAmount > currentBalance.balance) {
            toast.error('Yetersiz bakiye');
            return;
        }

        // Show confirmation dialog
        Alert.alert(
            'Gönderimi Onayla',
            `${numericAmount} ${selectedAsset} göndermek istediğinden emin misin?\n\nAlıcı: ${recipientAddress.slice(0, 10)}...${recipientAddress.slice(-8)}`,
            [
                {
                    text: 'Vazgeç',
                    style: 'cancel'
                },
                {
                    text: 'Gönder',
                    style: 'default',
                    onPress: async () => {
                        setIsSending(true);

                        try {
                            // Get the correct account based on selected asset
                            // Account 0 for XAUT, Account 1 for USDT
                            const accountIndex = selectedAsset === 'XAUT' ? 0 : 1;
                            const senderAccount = await wallet.manager.getAccount(accountIndex);

                            // Get contract address for the selected token
                            const tokenAddress = CONTRACT_ADDRESSES[selectedAsset];

                            // Convert amount to base units
                            const decimals = selectedAsset === 'USDT' ? 6 : 18;
                            const amountInBaseUnits = BigInt(Math.floor(numericAmount * (10 ** decimals)));

                            let transferResult;

                            if (!tokenAddress || tokenAddress === '') {
                                // Send native ETH transaction (no warning, just do it)
                                transferResult = await senderAccount.sendTransaction({
                                    to: recipientAddress,
                                    value: amountInBaseUnits,
                                });
                            } else {
                                // Use account.transfer() for ERC-20 tokens
                                transferResult = await senderAccount.transfer({
                                    token: tokenAddress,
                                    recipient: recipientAddress,
                                    amount: amountInBaseUnits
                                });
                            }

                            console.log('Transfer hash:', transferResult.hash);
                            console.log('Transfer fee:', transferResult.fee, 'wei');

                            toast.success('Transfer başarılı!');

                            // Navigate to success screen
                            router.replace({
                                pathname: '/transaction/success',
                                params: {
                                    amount: amount,
                                    symbol: selectedAsset,
                                    txHash: transferResult.hash
                                }
                            });

                            // Refresh balances
                            await refreshWalletBalance();

                        } catch (error) {
                            console.error('Transfer failed:', error);
                            const errorMessage = error instanceof Error ? error.message : 'Transfer başarısız';

                            router.push({
                                pathname: '/transaction/failed',
                                params: {
                                    reason: errorMessage
                                }
                            });
                        } finally {
                            setIsSending(false);
                        }
                    }
                }
            ]
        );
    };

    const currentBalance = getBalance();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Para Gönder" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.iconContainer}>
                        <Send size={48} color={colors.primary} />
                    </View>

                    <Text style={styles.title}>Kime Göndereceksin?</Text>
                    <Text style={styles.subtitle}>
                        Alıcı cüzdan adresini gir ve göndermek istediğin tutarı belirle.
                    </Text>

                    {/* VARLIK SEÇİMİ */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Hangi Varlığı Göndereceksin?</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.optionCard, selectedAsset === 'XAUT' && styles.optionSelected]}
                                onPress={() => setSelectedAsset('XAUT')}
                            >
                                <Text style={styles.optionEmoji}>🪙</Text>
                                <Text style={[styles.optionTitle, selectedAsset === 'XAUT' && styles.textSelected]}>
                                    Altın (XAUT)
                                </Text>
                                {selectedAsset === 'XAUT' && (
                                    <View style={styles.checkIcon}>
                                        <Check size={16} color={colors.black} />
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.optionCard, selectedAsset === 'USDT' && styles.optionSelected]}
                                onPress={() => setSelectedAsset('USDT')}
                            >
                                <Text style={styles.optionEmoji}>💵</Text>
                                <Text style={[styles.optionTitle, selectedAsset === 'USDT' && styles.textSelected]}>
                                    Dolar (USDT)
                                </Text>
                                {selectedAsset === 'USDT' && (
                                    <View style={styles.checkIcon}>
                                        <Check size={16} color={colors.black} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        {balances.isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={styles.balanceText}>Bakiye yükleniyor...</Text>
                            </View>
                        ) : (
                            <Text style={styles.balanceText}>
                                Bakiye: {currentBalance.formatted} {selectedAsset}
                            </Text>
                        )}
                    </View>

                    {/* ALICI ADRESİ */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Alıcı Cüzdan Adresi</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0x..."
                            placeholderTextColor={colors.textTertiary}
                            value={recipientAddress}
                            onChangeText={setRecipientAddress}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* TUTAR */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Miktar ({selectedAsset})</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor={colors.textTertiary}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9.,]/g, '');
                                const normalized = cleaned.replace(',', '.');
                                const parts = normalized.split('.');
                                if (parts.length > 2) return;
                                setAmount(normalized);
                            }}
                        />
                        <TouchableOpacity
                            style={styles.maxButton}
                            onPress={() => setAmount(currentBalance.balance.toString())}
                        >
                            <Text style={styles.maxButtonText}>Tümünü Kullan</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                    style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={isSending}
                >
                    {isSending ? (
                        <ActivityIndicator size="small" color={colors.black} />
                    ) : (
                        <Text style={styles.sendButtonText}>Gönder</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
    },
    iconContainer: {
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        color: colors.text,
        fontSize: 18,
        borderWidth: 1,
        borderColor: colors.border,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    optionCard: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        position: 'relative',
    },
    optionSelected: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
    },
    optionEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    optionTitle: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '600',
    },
    textSelected: {
        color: colors.primary,
    },
    checkIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: 2,
    },
    balanceText: {
        fontSize: 12,
        color: colors.textTertiary,
        marginTop: 6,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    maxButton: {
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    maxButtonText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.card,
    },
    sendButton: {
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    sendButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.black,
    },
});
